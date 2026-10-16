import crypto from 'crypto';
import { adminDb } from './_services/firebaseAdmin.js';
import { calculateGstBreakdown } from './_services/taxService.js';
import { resolveOrderAdvancePolicy, DEFAULT_ADVANCE_POLICY } from './_services/advancePolicyService.js';
import { createCashfreeOrder } from './_services/cashfreeService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const {
      idempotencyKey,
      items = [],
      customer = {},
      shippingAddress = {},
      couponCode,
      isExpress,
      artwork = [],
      existingOrderId
    } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart must contain at least one valid item.' });
    }

    if (!customer.phone || !customer.name) {
      return res.status(400).json({ error: 'Customer name and 10-digit mobile phone are required.' });
    }

    const cleanPhone = customer.phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ error: 'Please provide a valid 10-digit Indian mobile number.' });
    }

    const normalizedEmail = (customer.email || '').trim().toLowerCase();

    // 1. Recalculate everything authoritatively on the server
    let recalculatedSubtotal = 0;
    const validatedItems = [];
    let dominantGstRate = 18;
    let pricesIncludeGst = true;

    for (const item of items) {
      const prodId = item.productId || item.id;
      const requestedQty = Math.max(1, parseInt(item.quantity || item.qty || 1, 10));
      let productName = item.productName || item.name || 'Custom Printed Product';
      let paymentPolicy = item.paymentPolicy || DEFAULT_ADVANCE_POLICY;
      let itemTaxRate = 18;
      let itemTaxInclusive = true;

      let dbBasePrice = 0;

      if (prodId && adminDb) {
        try {
          const docSnap = await adminDb.collection('products').doc(String(prodId)).get();
          if (docSnap.exists) {
            const data = docSnap.data();
            productName = data.title || data.name || productName;
            dbBasePrice = Math.max(0, Number(data.basePrice ?? data.price ?? 0));
            if (data.paymentPolicy) paymentPolicy = data.paymentPolicy;
            if (data.taxRate !== undefined) itemTaxRate = Number(data.taxRate);
            if (data.taxInclusive !== undefined) itemTaxInclusive = Boolean(data.taxInclusive);
          }
        } catch (e) {
          console.warn(`[Create CF Order] DB warning for product ${prodId}:`, e.message);
        }
      }

      dominantGstRate = itemTaxRate;
      pricesIncludeGst = itemTaxInclusive;

      // Calculate total price respecting user-selected addons (lamination, paper, sides, custom dimensions)
      const submittedUnitPrice = Math.max(0, Number(item.unitPrice) || 0);
      const submittedTotalPrice = Math.max(0, Number(item.totalPrice) || (submittedUnitPrice * requestedQty));
      const itemTotal = submittedTotalPrice > 0 
        ? submittedTotalPrice 
        : (submittedUnitPrice > 0 ? submittedUnitPrice * requestedQty : dbBasePrice * requestedQty);

      const unitPrice = requestedQty > 0 ? Math.round((itemTotal / requestedQty) * 100) / 100 : itemTotal;
      recalculatedSubtotal += itemTotal;

      validatedItems.push({
        productId: prodId || null,
        productName,
        paper: item.paper || item.selectedOptions?.paperStock || '',
        finish: item.finish || item.selectedOptions?.finishes || item.selectedOptions?.lamination || '',
        sides: item.sides || item.selectedOptions?.sides || '',
        corners: item.corners || item.selectedOptions?.corners || '',
        selectedOptions: item.selectedOptions || {},
        variant: item.variant || '',
        quantity: requestedQty,
        unitPrice,
        totalPrice: itemTotal,
        paymentPolicy,
        artworkFiles: item.artworkFiles || [],
        artworkNotes: item.artworkNotes || ''
      });
    }

    // Coupon discount logic
    let couponDiscount = 0;
    const cleanCoupon = (couponCode || '').trim().toUpperCase();
    if (cleanCoupon === 'WELCOME10') {
      couponDiscount = Math.round((recalculatedSubtotal * 10) / 100);
    } else if (cleanCoupon === 'PRINT20' && recalculatedSubtotal >= 2000) {
      couponDiscount = Math.round((recalculatedSubtotal * 20) / 100);
    } else if (cleanCoupon === 'FLAT100' && recalculatedSubtotal >= 999) {
      couponDiscount = 100;
    } else if (cleanCoupon === 'PRINT50') {
      couponDiscount = 50;
    }

    const expressFee = isExpress ? 299 : 0;
    const shippingFee = (recalculatedSubtotal > 999 || recalculatedSubtotal === 0) ? 0 : 99;
    const customerState = shippingAddress?.state || customer?.state || '';

    // Calculate official GST breakdown
    const taxBreakdown = calculateGstBreakdown({
      subtotal: recalculatedSubtotal,
      discount: couponDiscount,
      shippingFee,
      expressFee,
      isShippingTaxable: true,
      pricesIncludeGst,
      gstRate: dominantGstRate,
      customerState
    });

    const finalPayable = taxBreakdown.finalPayable;

    // Resolve advance payment policy & schedule
    const advanceResolution = resolveOrderAdvancePolicy({
      items: validatedItems,
      finalPayable
    });

    const requiredAdvanceAmount = advanceResolution.advanceAmount;

    // 2. Safe Checkout Session Resolution (Prevent duplicate sessions on retries)
    // NOTE: In-flight checkouts are saved in 'checkout_sessions', NEVER in 'orders'!
    // A document only enters 'orders' once online payment is completed and verified.
    let sessionDocRef = null;
    let sessionData = null;
    let internalOrderId = null;
    let orderNumber = null;

    if (adminDb) {
      // Check for existing checkout session by id or idempotencyKey
      if (existingOrderId) {
        const existingSnap = await adminDb.collection('checkout_sessions').doc(existingOrderId).get();
        if (existingSnap.exists) {
          sessionDocRef = existingSnap.ref;
          sessionData = existingSnap.data();
          internalOrderId = existingSnap.id;
          orderNumber = sessionData.orderNumber || sessionData.orderId;
        }
      }

      if (!sessionDocRef && idempotencyKey) {
        const idempSnap = await adminDb.collection('checkout_sessions')
          .where('idempotencyKey', '==', idempotencyKey)
          .limit(1)
          .get();
        if (!idempSnap.empty) {
          sessionDocRef = idempSnap.docs[0].ref;
          sessionData = idempSnap.docs[0].data();
          internalOrderId = idempSnap.docs[0].id;
          orderNumber = sessionData.orderNumber || sessionData.orderId;
        }
      }

      // If no existing session doc, create a new pending checkout session
      if (!sessionDocRef) {
        sessionDocRef = adminDb.collection('checkout_sessions').doc();
        internalOrderId = sessionDocRef.id;
        orderNumber = `PRT-${Math.floor(100000 + Math.random() * 900000)}`;

        const customerId = customer.customerId || `VB-CUST-${Math.floor(10000 + Math.random() * 90000)}`;
        const fullAddressStr = typeof shippingAddress === 'string'
          ? shippingAddress
          : `${shippingAddress.addressLine1 || ''}${shippingAddress.addressLine2 ? ', ' + shippingAddress.addressLine2 : ''}, ${shippingAddress.landmark ? shippingAddress.landmark + ', ' : ''}${shippingAddress.city || ''}, ${shippingAddress.state || ''} - ${shippingAddress.pincode || ''}`;

        sessionData = {
          id: internalOrderId,
          sessionId: internalOrderId,
          orderId: orderNumber,
          orderNumber,
          idempotencyKey: idempotencyKey || internalOrderId,
          customerId,
          userId: req.body.userId || null,
          isGuest: !req.body.userId,
          customer: {
            customerId,
            name: customer.name.trim(),
            email: normalizedEmail,
            phone: cleanPhone,
            company: customer.company || '',
            gstin: customer.gstin || '',
            isB2B: !!customer.isB2B
          },
          shippingAddress: {
            ...shippingAddress,
            fullAddress: fullAddressStr
          },
          deliveryAddress: fullAddressStr,
          deliveryMethod: 'Standard Delivery',
          items: validatedItems,
          pricing: {
            subtotal: taxBreakdown.subtotal,
            couponCode: cleanCoupon || null,
            couponDiscount: taxBreakdown.discount,
            expressFee: taxBreakdown.expressFee,
            shippingFee: taxBreakdown.shippingFee,
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
            grandTotal: taxBreakdown.finalPayable,
            advanceAmountDue: requiredAdvanceAmount,
            remainingBalance: advanceResolution.remainingAmount,
            totalAmount: taxBreakdown.finalPayable
          },
          subtotal: taxBreakdown.subtotal,
          shippingFee: taxBreakdown.shippingFee,
          totalAmount: taxBreakdown.finalPayable,
          totalPaid: 0,
          outstandingBalance: taxBreakdown.finalPayable,
          advancePolicySnapshot: advanceResolution.policySnapshot,
          installments: advanceResolution.installments,
          paymentMethod: 'cashfree',
          paymentStatus: 'pending', // pending, partial, paid, failed
          status: 'Payment Pending',
          isPendingCheckout: true,
          isExpress: !!isExpress,
          artwork: artwork || [],
          paymentAttempts: [],
          paymentsLedger: [],
          auditTrail: [{
            action: 'CHECKOUT_SESSION_INITIALIZED',
            changedBy: 'system',
            details: `Checkout session created with ₹${requiredAdvanceAmount} (${advanceResolution.effectivePercentage}%) initial advance requirement.`,
            timestamp: new Date().toISOString()
          }],
          emailStatus: { customer: 'pending', admin: 'pending' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await sessionDocRef.set(sessionData);
      }
    }

    // Fallback session identifiers if adminDb not loaded
    if (!internalOrderId) {
      internalOrderId = `sess_${Date.now()}`;
      orderNumber = `PRT-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    // 3. Create Cashfree Payment Order
    // Cashfree order_id: must be unique per payment attempt, prefixed with internal order
    const cfAttemptId = `cf_${orderNumber}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const returnUrl = `${process.env.APP_BASE_URL || 'http://localhost:5173'}/payment-callback?order_id=${orderNumber}&cf_order_id={order_id}`;

    let cfOrderResult;
    try {
      cfOrderResult = await createCashfreeOrder({
        orderId: cfAttemptId,
        orderAmount: requiredAdvanceAmount,
        currency: 'INR',
        customer: {
          id: customer.customerId || sessionData?.customerId || `cust_${cleanPhone}`,
          name: customer.name.trim(),
          email: normalizedEmail,
          phone: cleanPhone
        },
        returnUrl,
        notifyUrl: `${process.env.APP_BASE_URL || 'https://visualblink.com'}/api/cashfree-webhook`,
        orderNote: `Advance payment for Order #${orderNumber}`
      });
    } catch (cfErr) {
      console.error('[Cashfree API Creation Failure]', cfErr);
      return res.status(502).json({
        error: 'Failed to communicate with Cashfree Payment Gateway.',
        details: cfErr.message
      });
    }

    // 4. Record payment attempt metadata against the checkout session
    if (adminDb && sessionDocRef) {
      const attemptMetadata = {
        attemptId: cfAttemptId,
        provider: 'cashfree',
        cfOrderId: cfOrderResult.orderId,
        paymentSessionId: cfOrderResult.paymentSessionId,
        amount: requiredAdvanceAmount,
        currency: 'INR',
        status: 'initiated',
        installmentId: sessionData?.installments?.[0]?.installmentId || null,
        createdAt: new Date().toISOString()
      };

      await sessionDocRef.update({
        paymentProviderOrderId: cfOrderResult.orderId,
        activePaymentAttempt: attemptMetadata,
        paymentAttempts: [...(sessionData?.paymentAttempts || []), attemptMetadata],
        updatedAt: new Date().toISOString()
      });
    }

    // 5. Return payment session to frontend (Never return secrets!)
    return res.status(200).json({
      success: true,
      internalOrderId,
      orderNumber,
      cfOrderId: cfOrderResult.orderId,
      paymentSessionId: cfOrderResult.paymentSessionId,
      advanceAmount: requiredAdvanceAmount,
      grandTotal: finalPayable,
      effectivePercentage: advanceResolution.effectivePercentage,
      currency: 'INR'
    });

  } catch (err) {
    console.error('[Create Cashfree Order Global Error]', err);
    return res.status(500).json({
      error: 'Failed to initiate secure Cashfree payment.',
      details: err.message
    });
  }
}
