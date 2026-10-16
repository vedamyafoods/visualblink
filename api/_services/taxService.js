/**
 * Tax Service for GST Calculations (India Tax Rules)
 * 
 * Ensures integer paise precision to eliminate floating-point rounding errors.
 * Default merchant state: Karnataka (29). Intra-state transactions apply CGST + SGST.
 * Inter-state transactions apply IGST.
 */

export const MERCHANT_STATE = 'Karnataka';
export const DEFAULT_GST_RATE = 18; // 18% standard GST rate for commercial printing

/**
 * Normalizes state names for comparison
 */
export function normalizeState(state) {
  if (!state || typeof state !== 'string') return '';
  return state.trim().toLowerCase();
}

/**
 * Determines whether a transaction is Intra-state (CGST + SGST) or Inter-state (IGST)
 */
export function isIntraStateTransaction(customerState, merchantState = MERCHANT_STATE) {
  const normCustomer = normalizeState(customerState);
  const normMerchant = normalizeState(merchantState);
  if (!normCustomer) return false; // Default to IGST if customer state is unknown
  return normCustomer === normMerchant;
}

/**
 * Calculates GST with integer paise precision
 * 
 * @param {Object} params
 * @param {number} params.subtotal - Item subtotal in Rupees
 * @param {number} params.discount - Applicable discount in Rupees
 * @param {number} params.shippingFee - Shipping fee in Rupees
 * @param {number} [params.expressFee=0] - Express turnaround fee in Rupees
 * @param {boolean} [params.isShippingTaxable=true] - Whether shipping and express fee are taxable
 * @param {boolean} [params.pricesIncludeGst=true] - Whether product prices already include GST
 * @param {number} [params.gstRate=DEFAULT_GST_RATE] - GST percentage (e.g. 18 for 18%)
 * @param {string} [params.customerState=''] - Customer delivery state
 * @param {string} [params.merchantState=MERCHANT_STATE] - Merchant origin state
 * 
 * @returns {Object} Immutable calculation breakdown
 */
export function calculateGstBreakdown({
  subtotal = 0,
  discount = 0,
  shippingFee = 0,
  expressFee = 0,
  isShippingTaxable = true,
  pricesIncludeGst = true,
  gstRate = DEFAULT_GST_RATE,
  customerState = '',
  merchantState = MERCHANT_STATE
}) {
  const effectiveGstRate = Number.isFinite(Number(gstRate)) ? Number(gstRate) : DEFAULT_GST_RATE;
  const intraState = isIntraStateTransaction(customerState, merchantState);

  // Convert all money values to integer paise (1 Rupee = 100 paise)
  const subtotalPaise = Math.round(Math.max(0, Number(subtotal) || 0) * 100);
  const discountPaise = Math.round(Math.max(0, Number(discount) || 0) * 100);
  const netGoodsPaise = Math.max(0, subtotalPaise - discountPaise);

  const shippingPaise = Math.round(Math.max(0, Number(shippingFee) || 0) * 100);
  const expressPaise = Math.round(Math.max(0, Number(expressFee) || 0) * 100);
  const totalLogisticsPaise = shippingPaise + expressPaise;

  let taxableGoodsPaise = 0;
  let gstOnGoodsPaise = 0;

  if (pricesIncludeGst && effectiveGstRate > 0) {
    // Reverse-calculate taxable amount from inclusive price:
    // Taxable = Inclusive / (1 + Rate / 100) = (Inclusive * 10000) / (10000 + Rate * 100)
    taxableGoodsPaise = Math.round((netGoodsPaise * 100) / (100 + effectiveGstRate));
    gstOnGoodsPaise = netGoodsPaise - taxableGoodsPaise;
  } else {
    // Exclusive: Taxable is the net price, GST is added on top
    taxableGoodsPaise = netGoodsPaise;
    gstOnGoodsPaise = effectiveGstRate > 0 ? Math.round((taxableGoodsPaise * effectiveGstRate) / 100) : 0;
  }

  // Calculate tax on logistics (shipping & express turnaround)
  let taxableLogisticsPaise = totalLogisticsPaise;
  let gstOnLogisticsPaise = 0;

  if (isShippingTaxable && totalLogisticsPaise > 0 && effectiveGstRate > 0) {
    // Shipping prices are quoted exclusive in current cart UI, so GST is applied on shipping
    gstOnLogisticsPaise = Math.round((taxableLogisticsPaise * effectiveGstRate) / 100);
  }

  const totalTaxablePaise = taxableGoodsPaise + taxableLogisticsPaise;
  const totalGstPaise = gstOnGoodsPaise + gstOnLogisticsPaise;

  let cgstPaise = 0;
  let sgstPaise = 0;
  let igstPaise = 0;

  if (intraState) {
    // Intra-state: Split equally into CGST & SGST
    cgstPaise = Math.floor(totalGstPaise / 2);
    sgstPaise = totalGstPaise - cgstPaise; // Prevent rounding drop
  } else {
    // Inter-state: Full tax is IGST
    igstPaise = totalGstPaise;
  }

  let finalPayablePaise = 0;
  if (pricesIncludeGst) {
    // Goods already have GST included; add logistics and tax on logistics
    finalPayablePaise = netGoodsPaise + totalLogisticsPaise + gstOnLogisticsPaise;
  } else {
    // Goods are GST exclusive; add tax on goods and tax on logistics
    finalPayablePaise = totalTaxablePaise + totalGstPaise;
  }

  return {
    subtotal: subtotalPaise / 100,
    discount: discountPaise / 100,
    shippingFee: shippingPaise / 100,
    expressFee: expressPaise / 100,
    taxableAmount: totalTaxablePaise / 100,
    gstRate: effectiveGstRate,
    pricesIncludeGst,
    isShippingTaxable,
    gstType: intraState ? 'CGST_SGST' : 'IGST',
    isCustomerIntraState: intraState,
    customerState: customerState || 'Unspecified (IGST Default)',
    cgst: cgstPaise / 100,
    sgst: sgstPaise / 100,
    igst: igstPaise / 100,
    totalGst: totalGstPaise / 100,
    finalPayable: finalPayablePaise / 100,
    // Exact paise for strict database ledger reconciliation
    paiseBreakdown: {
      subtotalPaise,
      discountPaise,
      shippingPaise,
      expressPaise,
      taxablePaise: totalTaxablePaise,
      totalGstPaise,
      cgstPaise,
      sgstPaise,
      igstPaise,
      finalPayablePaise
    }
  };
}
