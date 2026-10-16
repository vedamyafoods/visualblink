/**
 * Advance Payment Policy Service
 * 
 * Supports:
 * - Percentage-based advance (e.g. 30%)
 * - Fixed-amount advance (e.g. ₹5,000)
 * - Hybrid policy (e.g. 20% with min ₹5,000 and max ₹25,000)
 * 
 * Deterministically aggregates mixed-product carts and builds initial installment schedules.
 */

export const DEFAULT_ADVANCE_POLICY = {
  type: 'percentage',
  percentage: 50, // Default 50% fallback if not specified on product
  fixedAmount: 0,
  minAdvance: 0,
  maxAdvance: 0
};

/**
 * Validates a payment policy definition
 */
export function validatePaymentPolicy(policy = {}) {
  const type = ['percentage', 'fixed', 'hybrid'].includes(policy.type) ? policy.type : 'percentage';
  const percentage = Math.max(0, Math.min(100, Number(policy.percentage) || 0));
  const fixedAmount = Math.max(0, Number(policy.fixedAmount) || 0);
  const minAdvance = Math.max(0, Number(policy.minAdvance) || 0);
  const maxAdvance = Math.max(0, Number(policy.maxAdvance) || 0);

  if (type === 'percentage') {
    return {
      isValid: percentage > 0 && percentage <= 100,
      policy: { type: 'percentage', percentage }
    };
  }

  if (type === 'fixed') {
    return {
      isValid: fixedAmount > 0,
      policy: { type: 'fixed', fixedAmount }
    };
  }

  if (type === 'hybrid') {
    const validCapping = maxAdvance === 0 || maxAdvance >= minAdvance;
    return {
      isValid: percentage > 0 && percentage <= 100 && validCapping,
      policy: { type: 'hybrid', percentage, minAdvance, maxAdvance }
    };
  }

  return { isValid: false, policy: DEFAULT_ADVANCE_POLICY };
}

/**
 * Calculates advance contribution for an individual cart item
 */
export function calculateItemAdvance(itemTotal, policy = DEFAULT_ADVANCE_POLICY) {
  const total = Math.max(0, Number(itemTotal) || 0);
  if (total === 0) return 0;

  const validPolicy = { ...DEFAULT_ADVANCE_POLICY, ...policy };

  if (validPolicy.type === 'percentage') {
    const pct = Math.max(0, Math.min(100, Number(validPolicy.percentage) || 50));
    return Math.round((total * pct) / 100);
  }

  if (validPolicy.type === 'fixed') {
    const fixed = Math.max(0, Number(validPolicy.fixedAmount) || 0);
    // Never exceed the line item total
    return Math.min(fixed, total);
  }

  if (validPolicy.type === 'hybrid') {
    const pct = Math.max(0, Math.min(100, Number(validPolicy.percentage) || 50));
    let calculated = Math.round((total * pct) / 100);
    if (validPolicy.minAdvance > 0) {
      calculated = Math.max(calculated, validPolicy.minAdvance);
    }
    if (validPolicy.maxAdvance > 0) {
      calculated = Math.min(calculated, validPolicy.maxAdvance);
    }
    // Never exceed line item total
    return Math.min(calculated, total);
  }

  return Math.round(total / 2);
}

/**
 * Resolves advance policy for the entire cart
 * 
 * @param {Object} params
 * @param {Array} params.items - Cart items with totalPrice/unitPrice & product paymentPolicy
 * @param {number} params.finalPayable - Total order payable amount (including GST and shipping)
 * @param {Object} [params.orderOverridePolicy] - Explicit administrator policy override
 */
export function resolveOrderAdvancePolicy({
  items = [],
  finalPayable = 0,
  orderOverridePolicy = null
}) {
  const grandTotal = Math.max(0, Number(finalPayable) || 0);

  if (grandTotal === 0) {
    return {
      advanceAmount: 0,
      remainingAmount: 0,
      effectivePercentage: 0,
      policySnapshot: { type: 'percentage', percentage: 0 },
      installments: []
    };
  }

  // 1. If administrator provides an explicit override for this order, honor it directly
  if (orderOverridePolicy && orderOverridePolicy.type) {
    let overrideAdvance = 0;
    if (orderOverridePolicy.type === 'percentage') {
      const pct = Math.max(0, Math.min(100, Number(orderOverridePolicy.percentage) || 50));
      overrideAdvance = Math.round((grandTotal * pct) / 100);
    } else if (orderOverridePolicy.type === 'fixed') {
      overrideAdvance = Math.min(Number(orderOverridePolicy.fixedAmount) || 0, grandTotal);
    } else if (orderOverridePolicy.type === 'hybrid') {
      const pct = Math.max(0, Math.min(100, Number(orderOverridePolicy.percentage) || 50));
      let calc = Math.round((grandTotal * pct) / 100);
      if (orderOverridePolicy.minAdvance) calc = Math.max(calc, orderOverridePolicy.minAdvance);
      if (orderOverridePolicy.maxAdvance) calc = Math.min(calc, orderOverridePolicy.maxAdvance);
      overrideAdvance = Math.min(calc, grandTotal);
    }

    const remaining = Math.max(0, grandTotal - overrideAdvance);
    const effPct = grandTotal > 0 ? Math.round((overrideAdvance / grandTotal) * 100) : 0;

    return {
      advanceAmount: overrideAdvance,
      remainingAmount: remaining,
      effectivePercentage: effPct,
      policySnapshot: { ...orderOverridePolicy, resolvedAdvanceAmount: overrideAdvance },
      installments: buildDefaultInstallments(overrideAdvance, remaining, effPct)
    };
  }

  // 2. Multi-product Cart Policy Resolution
  let totalItemsPrice = 0;
  let totalItemsAdvanceContribution = 0;

  for (const item of items) {
    const itemTotal = Number(item.totalPrice) || (Number(item.quantity || item.qty || 1) * Number(item.unitPrice || 0));
    totalItemsPrice += itemTotal;

    const itemPolicy = item.paymentPolicy || item.product?.paymentPolicy || DEFAULT_ADVANCE_POLICY;
    const itemAdv = calculateItemAdvance(itemTotal, itemPolicy);
    totalItemsAdvanceContribution += itemAdv;
  }

  // Determine ratio of items advance to total items price
  const itemsAdvanceRatio = totalItemsPrice > 0 ? totalItemsAdvanceContribution / totalItemsPrice : 0.5;

  // Apply proportionally to grandTotal (which includes taxes and logistics)
  let resolvedAdvance = Math.round(grandTotal * itemsAdvanceRatio);

  // Bounds checks: Advance cannot be less than ₹1 (if grandTotal > 0) and cannot exceed grandTotal
  resolvedAdvance = Math.max(1, Math.min(resolvedAdvance, grandTotal));
  const remainingAmount = Math.max(0, Math.round((grandTotal - resolvedAdvance) * 100) / 100);
  const effectivePercentage = Math.round((resolvedAdvance / grandTotal) * 100);

  // Create immutable snapshot of policy used
  const primaryItemPolicy = items[0]?.paymentPolicy || items[0]?.product?.paymentPolicy || DEFAULT_ADVANCE_POLICY;
  const policySnapshot = {
    type: items.length === 1 ? primaryItemPolicy.type : 'mixed_cart_weighted',
    percentage: effectivePercentage,
    fixedAmount: primaryItemPolicy.fixedAmount || 0,
    minAdvance: primaryItemPolicy.minAdvance || 0,
    maxAdvance: primaryItemPolicy.maxAdvance || 0,
    resolvedAdvanceAmount: resolvedAdvance,
    calculatedAt: new Date().toISOString()
  };

  return {
    advanceAmount: resolvedAdvance,
    remainingAmount,
    effectivePercentage,
    policySnapshot,
    installments: buildDefaultInstallments(resolvedAdvance, remainingAmount, effectivePercentage)
  };
}

/**
 * Builds standard 2-installment schedule (Advance + Balance on Dispatch)
 */
function buildDefaultInstallments(advanceAmount, remainingAmount, advancePercentage) {
  const installments = [];

  // Installment 1: Advance payment due immediately
  installments.push({
    installmentId: `inst_${Date.now()}_1`,
    seq: 1,
    name: `Initial Advance (${advancePercentage}%)`,
    description: 'Advance payment due online to confirm order and initiate print production',
    amount: advanceAmount,
    percentage: advancePercentage,
    dueDate: new Date().toISOString(),
    status: 'Due', // Due, Paid, Pending Verification, Failed, Cancelled
    paidAmount: 0,
    paymentMethod: null,
    transactionId: null,
    paidAt: null
  });

  // Installment 2: Remaining balance payable prior to dispatch or on delivery
  if (remainingAmount > 0) {
    const remainingPercentage = 100 - advancePercentage;
    installments.push({
      installmentId: `inst_${Date.now()}_2`,
      seq: 2,
      name: `Final Balance (${remainingPercentage}%)`,
      description: 'Remaining order balance payable upon production completion prior to dispatch',
      amount: Math.round(remainingAmount * 100) / 100,
      percentage: remainingPercentage,
      dueDate: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(), // ~4 business days standard
      status: 'Upcoming',
      paidAmount: 0,
      paymentMethod: null,
      transactionId: null,
      paidAt: null
    });
  }

  return installments;
}
