import { adminDb } from './_services/firebaseAdmin.js';
import { calculateGstBreakdown } from './_services/taxService.js';
import { resolveOrderAdvancePolicy, DEFAULT_ADVANCE_POLICY } from './_services/advancePolicyService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { items = [], couponCode, isExpress, shippingAddress = {}, customer = {} } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required.' });
    }

    let recalculatedSubtotal = 0;
    const validatedItems = [];
    let dominantGstRate = 18;
    let pricesIncludeGst = true;

    // Fetch product pricing & policies from database
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
            if (data.paymentPolicy) {
              paymentPolicy = data.paymentPolicy;
            }
            if (data.taxRate !== undefined) {
              itemTaxRate = Number(data.taxRate);
            }
            if (data.taxInclusive !== undefined) {
              itemTaxInclusive = Boolean(data.taxInclusive);
            }
          }
        } catch (dbErr) {
          console.warn(`[Summary Calc] Firestore fetch note for product ${prodId}:`, dbErr.message);
        }
      }

      dominantGstRate = itemTaxRate;
      pricesIncludeGst = itemTaxInclusive;

      // Calculate total price respecting user-selected addons (lamination, paper, sides, custom dimensions)
      const submittedUnitPrice = Math.max(0, Number(item.unitPrice) || 0);
      const submittedTotalPrice = Math.max(0, Number(item.totalPrice) || (submittedUnitPrice * requestedQty));
      const itemTotalPrice = submittedTotalPrice > 0 
        ? submittedTotalPrice 
        : (submittedUnitPrice > 0 ? submittedUnitPrice * requestedQty : dbBasePrice * requestedQty);
      
      const unitPrice = requestedQty > 0 ? Math.round((itemTotalPrice / requestedQty) * 100) / 100 : itemTotalPrice;
      recalculatedSubtotal += itemTotalPrice;

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
        totalPrice: itemTotalPrice,
        paymentPolicy,
        taxRate: itemTaxRate,
        taxInclusive: itemTaxInclusive
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

    // Shipping fee (Free if subtotal > 999)
    const expressFee = isExpress ? 299 : 0;
    const shippingFee = (recalculatedSubtotal > 999 || recalculatedSubtotal === 0) ? 0 : 99;

    // Resolve Customer Destination State (defaults to Karnataka for local, or destination state)
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

    // Resolve advance payment policy & installment schedule
    const advanceResolution = resolveOrderAdvancePolicy({
      items: validatedItems,
      finalPayable
    });

    return res.status(200).json({
      success: true,
      summary: {
        items: validatedItems,
        subtotal: taxBreakdown.subtotal,
        discount: taxBreakdown.discount,
        shippingFee: taxBreakdown.shippingFee,
        expressFee: taxBreakdown.expressFee,
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
        finalPayable: taxBreakdown.finalPayable,
        advanceAmountDue: advanceResolution.advanceAmount,
        remainingBalance: advanceResolution.remainingAmount,
        advancePercentage: advanceResolution.effectivePercentage,
        policySnapshot: advanceResolution.policySnapshot,
        installments: advanceResolution.installments
      }
    });

  } catch (err) {
    console.error('[Calculate Order Summary Error]', err);
    return res.status(500).json({ error: 'Failed to calculate order summary.', details: err.message });
  }
}
