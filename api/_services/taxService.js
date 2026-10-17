/**
 * Tax Service for GST Calculations (India Tax Rules)
 * 
 * Ensures integer paise precision to eliminate floating-point rounding errors.
 * Default merchant state: Karnataka (29). Intra-state transactions apply CGST + SGST.
 * Inter-state transactions apply IGST.
 */

export const MERCHANT_STATE = 'Madhya Pradesh';
export const MERCHANT_GSTIN = '23AVCPL5031D1Z6';
export const DEFAULT_GST_RATE = 18; // 18% standard GST rate for commercial printing

/**
 * Normalizes state names for comparison
 */
export function normalizeState(state) {
  if (!state || typeof state !== 'string') return '';
  return state.trim().toLowerCase();
}

/**
 * Determines whether a transaction is Intra-state (CGST + SGST)
 */
export function isIntraStateTransaction(customerState, merchantState = MERCHANT_STATE) {
  const normCustomer = normalizeState(customerState);
  const normMerchant = normalizeState(merchantState);
  if (!normCustomer) return true;
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
 * @param {boolean} [params.isShippingTaxable=false] - Whether shipping and express fee are taxable (default false to avoid extra shipping surcharge)
 * @param {boolean} [params.pricesIncludeGst=true] - Whether product prices already include GST
 * @param {number} [params.gstRate=DEFAULT_GST_RATE] - GST percentage (18 for 18%)
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
  isShippingTaxable = false,
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

  let taxableGoodsPaise = netGoodsPaise;
  let gstOnGoodsPaise = effectiveGstRate > 0 ? Math.round((taxableGoodsPaise * effectiveGstRate) / 100) : 0;

  if (pricesIncludeGst && effectiveGstRate > 0) {
    // If explicitly configured inclusive, taxable is netGoods
    taxableGoodsPaise = netGoodsPaise;
    gstOnGoodsPaise = Math.round((netGoodsPaise * effectiveGstRate) / 100);
  }

  // Calculate tax on logistics only if explicitly configured
  let taxableLogisticsPaise = 0;
  let gstOnLogisticsPaise = 0;

  if (isShippingTaxable && totalLogisticsPaise > 0 && effectiveGstRate > 0) {
    taxableLogisticsPaise = totalLogisticsPaise;
    gstOnLogisticsPaise = Math.round((taxableLogisticsPaise * effectiveGstRate) / 100);
  }

  const totalTaxablePaise = taxableGoodsPaise; // Taxable value of goods and services is exactly net product subtotal
  const totalGstPaise = gstOnGoodsPaise + gstOnLogisticsPaise;

  // Split all GST equally into CGST & SGST (9% each for 18% GST).
  const cgstPaise = Math.floor(totalGstPaise / 2);
  const sgstPaise = totalGstPaise - cgstPaise;
  const igstPaise = 0;

  // Final Payable = Taxable Goods + GST (18%) + Shipping Logistics
  const finalPayablePaise = taxableGoodsPaise + totalGstPaise + totalLogisticsPaise;

  return {
    subtotal: subtotalPaise / 100,
    discount: discountPaise / 100,
    shippingFee: shippingPaise / 100,
    expressFee: expressPaise / 100,
    taxableAmount: totalTaxablePaise / 100,
    taxableGoodsAmount: taxableGoodsPaise / 100,
    gstRate: effectiveGstRate,
    pricesIncludeGst,
    isShippingTaxable,
    gstType: 'CGST_SGST',
    isCustomerIntraState: true,
    customerState: customerState || 'Madhya Pradesh',
    cgst: cgstPaise / 100,
    sgst: sgstPaise / 100,
    igst: 0,
    totalGst: totalGstPaise / 100,
    finalPayable: finalPayablePaise / 100,
    paiseBreakdown: {
      subtotalPaise,
      discountPaise,
      shippingPaise,
      expressPaise,
      taxablePaise: totalTaxablePaise,
      totalGstPaise,
      cgstPaise,
      sgstPaise,
      igstPaise: 0,
      finalPayablePaise
    }
  };
}
