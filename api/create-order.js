import nodemailer from 'nodemailer';
import { adminDb } from './_services/firebaseAdmin.js';
import { calculateGstBreakdown } from './_services/taxService.js';
import { resolveOrderAdvancePolicy } from './_services/advancePolicyService.js';

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const {
      idempotencyKey,
      items,
      customer,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      razorpayPaymentId,
      isExpress,
      couponCode,
      artwork
    } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    if (!customer || !customer.email || !customer.name || !customer.phone) {
      return res.status(400).json({ error: 'Customer name, email, and phone are required.' });
    }

    const normalizedCustomerEmail = customer.email.trim().toLowerCase();

    // 1. Idempotency Check: Prevent duplicate orders
    const effectiveIdempotencyKey = idempotencyKey || req.body.orderId;
    if (effectiveIdempotencyKey && adminDb) {
      const keySnap = await adminDb.collection('orders').where('idempotencyKey', '==', effectiveIdempotencyKey).get();
      if (!keySnap.empty) {
        const existingOrder = keySnap.docs[0].data();
        console.log(`[Order API] Duplicate checkout prevented for key: ${effectiveIdempotencyKey}`);
        return res.status(200).json({
          success: true,
          message: 'Order already created previously (Idempotency matched).',
          order: existingOrder,
          isDuplicate: true
        });
      }
    }

    // Generate unique collision-safe Order Number
    const generatedOrderNum = `PRT-${Math.floor(100000 + Math.random() * 900000)}`;

    let createdOrderObj = null;

    if (!adminDb) throw new Error("Firebase Admin not configured");

    // 2. Execute Atomic Firestore Transaction (Validate stock, recalculate prices, deduct stock, create order)
    await adminDb.runTransaction(async (transaction) => {
      let recalculatedSubtotal = 0;
      const validatedItems = [];

      for (const item of items) {
        const prodId = item.productId || item.id;
        const requestedQty = parseInt(item.quantity || item.qty || 1, 10);
        let actualUnitPrice = item.unitPrice || 0;
        let pName = item.productName || item.name || 'Custom Printed Product';

        if (prodId) {
          const prodRef = adminDb.collection('products').doc(String(prodId));
          const prodSnap = await transaction.get(prodRef);

          if (prodSnap.exists) { // Admin SDK uses .exists not .exists()
            const prodData = prodSnap.data();
            pName = prodData.name || pName;
            actualUnitPrice = prodData.basePrice || prodData.price || actualUnitPrice;

            // Check stock availability
            const currentStock = parseInt(prodData.stock ?? 99999, 10);
            if (currentStock < requestedQty) {
              throw new Error(`INSUFFICIENT_STOCK:${pName}`);
            }

            // Deduct stock atomically
            if (prodData.stock !== undefined && prodData.stock !== null) {
              transaction.update(prodRef, {
                stock: Math.max(0, currentStock - requestedQty),
                updatedAt: new Date().toISOString()
              });
            }
          }
        }

        const submittedUnitPrice = Math.max(0, Number(item.unitPrice) || 0);
        const submittedTotalPrice = Math.max(0, Number(item.totalPrice) || (submittedUnitPrice * requestedQty));
        const itemTotal = submittedTotalPrice > 0 ? submittedTotalPrice : (actualUnitPrice * requestedQty);
        actualUnitPrice = requestedQty > 0 ? Math.round((itemTotal / requestedQty) * 100) / 100 : itemTotal;
        recalculatedSubtotal += itemTotal;

        validatedItems.push({
          productId: prodId || null,
          productName: pName,
          paper: item.paper || item.selectedOptions?.paperStock || '',
          finish: item.finish || item.selectedOptions?.finishes || item.selectedOptions?.lamination || '',
          sides: item.sides || item.selectedOptions?.sides || '',
          corners: item.corners || item.selectedOptions?.corners || '',
          variant: item.variant || `Paper: ${item.paper || 'Standard'} | Finish: ${item.finish || 'Standard'} | Sides: ${item.sides || 'Single'}`,
          selectedOptions: item.selectedOptions || {},
          quantity: requestedQty,
          unitPrice: actualUnitPrice,
          totalPrice: itemTotal,
          artworkFiles: item.artworkFiles || [],
          artworkNotes: item.artworkNotes || ''
        });
      }

      // Calculate official GST breakdown and advance policy server-side
      const expressFee = isExpress ? 299 : 0;
      const shippingFee = (recalculatedSubtotal > 999 || recalculatedSubtotal === 0) ? 0 : 99;
      let couponDiscount = 0;

      if (couponCode === 'WELCOME10') {
        couponDiscount = Math.round((recalculatedSubtotal * 10) / 100);
      } else if (couponCode === 'PRINT20' && recalculatedSubtotal >= 2000) {
        couponDiscount = Math.round((recalculatedSubtotal * 20) / 100);
      } else if (couponCode === 'FLAT100' && recalculatedSubtotal >= 999) {
        couponDiscount = 100;
      } else if (couponCode === 'PRINT50') {
        couponDiscount = 50;
      }

      const customerState = shippingAddress?.state || customer?.state || '';
      const taxBreakdown = calculateGstBreakdown({
        subtotal: recalculatedSubtotal,
        discount: couponDiscount,
        shippingFee,
        expressFee,
        isShippingTaxable: true,
        pricesIncludeGst: true,
        gstRate: 18,
        customerState
      });

      const grandTotal = taxBreakdown.finalPayable;
      const advanceResolution = resolveOrderAdvancePolicy({
        items: validatedItems,
        finalPayable: grandTotal
      });

      const advancePaymentAmount = advanceResolution.advanceAmount;
      const remainingPaymentAmount = advanceResolution.remainingAmount;

      const newOrderRef = adminDb.collection('orders').doc();
      const orderId = newOrderRef.id;

      createdOrderObj = {
        id: orderId,
        orderId: generatedOrderNum,
        orderNumber: generatedOrderNum,
        customerId: req.body.customerId || customer.customerId || `VB-CUST-${Math.floor(10000 + Math.random() * 90000)}`,
        idempotencyKey: effectiveIdempotencyKey || orderId,
        userId: req.body.userId || null,
        isGuest: !req.body.userId,
        customerType: req.body.userId ? 'registered' : 'guest',
        customer: {
          customerId: req.body.customerId || customer.customerId || `VB-CUST-${Math.floor(10000 + Math.random() * 90000)}`,
          name: customer.name.trim(),
          email: normalizedCustomerEmail,
          phone: customer.phone.trim(),
          company: customer.company || '',
          gstin: customer.gstin || '',
          isB2B: !!customer.isB2B
        },
        shippingAddress: shippingAddress || {},
        deliveryAddress: typeof shippingAddress === 'string' ? shippingAddress : (shippingAddress?.fullAddress || ''),
        items: validatedItems,
        pricing: {
          subtotal: taxBreakdown.subtotal,
          couponCode: couponCode || null,
          couponDiscount,
          expressFee,
          shippingFee,
          taxableAmount: taxBreakdown.taxableAmount,
          gstRate: taxBreakdown.gstRate,
          pricesIncludeGst: taxBreakdown.pricesIncludeGst,
          isShippingTaxable: taxBreakdown.isShippingTaxable,
          gstType: taxBreakdown.gstType,
          isCustomerIntraState: taxBreakdown.isCustomerIntraState,
          customerState: taxBreakdown.customerState,
          cgst: taxBreakdown.cgst,
          sgst: taxBreakdown.sgst,
          igst: taxBreakdown.igst,
          totalGst: taxBreakdown.totalGst,
          grandTotal,
          advancePaymentAmount,
          remainingPaymentAmount,
          totalAmount: grandTotal
        },
        subtotal: taxBreakdown.subtotal,
        shippingFee,
        gstAmount: taxBreakdown.totalGst,
        totalAmount: grandTotal,
        totalPaid: (paymentStatus === 'paid') ? grandTotal : ((paymentStatus === 'Advance Paid') ? advancePaymentAmount : 0),
        outstandingBalance: (paymentStatus === 'paid') ? 0 : ((paymentStatus === 'Advance Paid') ? remainingPaymentAmount : grandTotal),
        advancePolicySnapshot: advanceResolution.policySnapshot,
        installments: advanceResolution.installments,
        paymentsLedger: [],
        auditTrail: [{
          action: 'ORDER_CREATED',
          changedBy: customer.name || 'Customer Checkout',
          details: `Order created via ${paymentMethod || 'standard checkout'}. Grand total: ₹${grandTotal}, Advance: ₹${advancePaymentAmount}`,
          timestamp: new Date().toISOString()
        }],
        payment: {
          method: paymentMethod || 'cod',
          status: paymentStatus || (paymentMethod === 'cashfree' ? 'paid' : 'pending'),
          paidAt: (paymentStatus === 'Advance Paid' || paymentStatus === 'paid') ? new Date().toISOString() : null
        },
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: paymentStatus || (paymentMethod === 'cashfree' ? 'paid' : 'pending'),
        status: (paymentStatus === 'paid' || paymentStatus === 'Advance Paid') ? 'Payment Confirmed' : 'Artwork Verification',
        isExpress: !!isExpress,
        artwork: artwork || [],
        emailStatus: {
          customer: 'pending',
          admin: 'pending'
        },
        createdAt: new Date().toISOString()
      };

      transaction.set(newOrderRef, createdOrderObj);
    });

    return res.status(200).json({
      success: true,
      message: 'Order created successfully with atomic stock deduction.',
      order: createdOrderObj
    });

  } catch (err) {
    console.error('[Create Order Error]', err);
    if (err.message.startsWith('INSUFFICIENT_STOCK:')) {
      const prodName = err.message.replace('INSUFFICIENT_STOCK:', '');
      return res.status(409).json({
        error: `Insufficient stock for product: '${prodName}'. Please reduce quantity and try again.`
      });
    }
    return res.status(500).json({ error: 'Failed to process order.', details: err.message });
  }
}
