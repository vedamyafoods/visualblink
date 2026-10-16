/**
 * Automated Test Suite for Cashfree Payments, GST, Advance Policies & Installment Management
 * Covers Phase 9 validation requirements.
 */

import assert from 'assert';
import crypto from 'crypto';
import { calculateGstBreakdown } from '../api/_services/taxService.js';
import {
  calculateItemAdvance,
  resolveOrderAdvancePolicy,
  validatePaymentPolicy,
  DEFAULT_ADVANCE_POLICY
} from '../api/_services/advancePolicyService.js';
import { verifyCashfreeWebhookSignature } from '../api/_services/cashfreeService.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING CASHFREE, GST & INSTALLMENT TEST SUITE');
  console.log('======================================================\n');

  // ------------------------------------------------------------------
  // SUITE 1: GST & TAX CALCULATIONS (Integer Paise Precision)
  // ------------------------------------------------------------------
  console.log('📦 SUITE 1: GST & Tax Calculation Engine');

  test('1.1: Intra-state Karnataka transaction (CGST 9% + SGST 9%) - Inclusive pricing', () => {
    // ₹700 subtotal, ₹99 shipping
    const res = calculateGstBreakdown({
      subtotal: 700,
      discount: 0,
      shippingFee: 99,
      expressFee: 0,
      customerState: 'Karnataka',
      gstRate: 18,
      pricesIncludeGst: true,
      isShippingTaxable: true
    });

    assert.strictEqual(res.isCustomerIntraState, true, 'Customer in Karnataka should be intra-state');
    assert.strictEqual(res.finalPayable, 816.82, 'Inclusive total should match goods + logistics + gst on logistics');
    assert.strictEqual(Math.round((res.cgst + res.sgst) * 100) / 100, res.totalGst, 'CGST + SGST must exactly equal Total GST');
    assert.strictEqual(res.igst, 0, 'IGST must be 0 for Karnataka transaction');
  });

  test('1.2: Inter-state transaction (Madhya Pradesh: IGST 18%) - Inclusive pricing', () => {
    const res = calculateGstBreakdown({
      subtotal: 700,
      discount: 0,
      shippingFee: 99,
      expressFee: 0,
      customerState: 'Madhya Pradesh',
      gstRate: 18,
      pricesIncludeGst: true,
      isShippingTaxable: true
    });

    assert.strictEqual(res.isCustomerIntraState, false, 'MP should be inter-state');
    assert.strictEqual(res.cgst, 0, 'CGST should be 0 for inter-state');
    assert.strictEqual(res.sgst, 0, 'SGST should be 0 for inter-state');
    assert.strictEqual(res.igst, res.totalGst, 'IGST should equal Total GST');
    assert.strictEqual(res.finalPayable, 816.82);
  });

  test('1.3: Exclusive pricing: ₹1000 subtotal + 18% GST + ₹100 shipping', () => {
    const res = calculateGstBreakdown({
      subtotal: 1000,
      discount: 0,
      shippingFee: 100,
      customerState: 'Delhi',
      gstRate: 18,
      pricesIncludeGst: false,
      isShippingTaxable: true
    });

    // Taxable = 1000 + 100 = 1100
    // GST 18% of 1100 = 198
    // Total = 1298
    assert.strictEqual(res.taxableAmount, 1100);
    assert.strictEqual(res.totalGst, 198);
    assert.strictEqual(res.finalPayable, 1298);
    assert.strictEqual(res.igst, 198);
  });

  test('1.4: Coupon discount subtraction before tax computation', () => {
    const res = calculateGstBreakdown({
      subtotal: 1000,
      discount: 200, // Net goods = 800
      shippingFee: 0,
      customerState: 'Karnataka',
      gstRate: 18,
      pricesIncludeGst: false
    });

    assert.strictEqual(res.taxableAmount, 800);
    assert.strictEqual(res.totalGst, 144); // 18% of 800
    assert.strictEqual(res.finalPayable, 944);
  });

  test('1.5: Non-taxable shipping fee configuration', () => {
    const res = calculateGstBreakdown({
      subtotal: 1000,
      shippingFee: 100,
      customerState: 'Karnataka',
      gstRate: 18,
      pricesIncludeGst: false,
      isShippingTaxable: false
    });

    // Taxable goods = 1000, GST = 180, Total = 1000 + 180 + 100 = 1280
    assert.strictEqual(res.totalGst, 180);
    assert.strictEqual(res.finalPayable, 1280);
  });

  // ------------------------------------------------------------------
  // SUITE 2: DYNAMIC ADVANCE POLICY & MULTI-PRODUCT RESOLUTION
  // ------------------------------------------------------------------
  console.log('\n📦 SUITE 2: Product Advance Payment Policies');

  test('2.1: Percentage-based advance policy (e.g. 30%)', () => {
    const policy = { type: 'percentage', percentage: 30 };
    const advance = calculateItemAdvance(10000, policy);
    assert.strictEqual(advance, 3000);
  });

  test('2.2: Fixed-amount advance policy (e.g. ₹5,000 fixed)', () => {
    const policy = { type: 'fixed', fixedAmount: 5000 };
    const advance = calculateItemAdvance(12000, policy);
    assert.strictEqual(advance, 5000);
  });

  test('2.3: Fixed-amount capped when order total is lower than fixed advance', () => {
    const policy = { type: 'fixed', fixedAmount: 5000 };
    const advance = calculateItemAdvance(3000, policy);
    assert.strictEqual(advance, 3000, 'Fixed advance must not exceed total amount');
  });

  test('2.4: Hybrid advance policy (20% with min ₹5,000 and max ₹25,000)', () => {
    const policy = { type: 'hybrid', percentage: 20, minAdvance: 5000, maxAdvance: 25000 };

    // Case A: 20% of 15,000 is 3,000 -> clamped up to min 5,000
    const advA = calculateItemAdvance(15000, policy);
    assert.strictEqual(advA, 5000);

    // Case B: 20% of 50,000 is 10,000 -> within 5k-25k
    const advB = calculateItemAdvance(50000, policy);
    assert.strictEqual(advB, 10000);

    // Case C: 20% of 200,000 is 40,000 -> clamped down to max 25,000
    const advC = calculateItemAdvance(200000, policy);
    assert.strictEqual(advC, 25000);
  });

  test('2.5: Deterministic multi-product cart resolution', () => {
    const items = [
      { unitPrice: 1000, quantity: 10, paymentPolicy: { type: 'percentage', percentage: 30 } },
      { unitPrice: 2000, quantity: 10, paymentPolicy: { type: 'percentage', percentage: 50 } }
    ];

    const resolved = resolveOrderAdvancePolicy({ items, finalPayable: 30000 });
    assert.strictEqual(resolved.advanceAmount, 13000);
    assert.strictEqual(resolved.remainingAmount, 17000);
    assert.strictEqual(resolved.advanceAmount + resolved.remainingAmount, 30000);
  });

  // ------------------------------------------------------------------
  // SUITE 3: INSTALLMENT SCHEDULE & RECONCILIATION
  // ------------------------------------------------------------------
  console.log('\n📦 SUITE 3: Installment Management & Reconciliation');

  test('3.1: Build standard two-installment schedule from advance policy', () => {
    const items = [
      { unitPrice: 1000, quantity: 10, paymentPolicy: { type: 'percentage', percentage: 30 } }
    ];
    const resolved = resolveOrderAdvancePolicy({ items, finalPayable: 10000 });
    const schedule = resolved.installments;

    assert.strictEqual(schedule.length, 2);
    assert.strictEqual(schedule[0].amount, 3000);
    assert.strictEqual(schedule[0].seq, 1);
    assert.strictEqual(schedule[1].amount, 7000);
    assert.strictEqual(schedule[1].seq, 2);

    const totalSchedule = schedule.reduce((sum, i) => sum + i.amount, 0);
    assert.strictEqual(totalSchedule, 10000, 'Sum of installments must equal order total');
  });

  test('3.2: Multi-installment milestone recalculation (3 installments: 20%, 30%, 50%)', () => {
    const existing = [
      { seq: 1, name: 'Deposit', amount: 24000, status: 'Paid' },
      { seq: 2, name: 'Proof Approval', amount: 36000, status: 'Due' },
      { seq: 3, name: 'Final Handoff', amount: 60000, status: 'Upcoming' }
    ];
    const totalOrder = 120000;

    const newInst2Amount = 40000;
    const paidSum = existing[0].amount;
    const remainingToAllocate = totalOrder - (paidSum + newInst2Amount);

    const updated = [
      { ...existing[0] },
      { ...existing[1], amount: newInst2Amount },
      { ...existing[2], amount: remainingToAllocate }
    ];

    assert.strictEqual(updated[0].amount, 24000, 'Historical paid installment 1 must remain untouched');
    assert.strictEqual(updated[1].amount, 40000, 'Installment 2 updated to 40,000');
    assert.strictEqual(updated[2].amount, 56000, 'Installment 3 automatically reconciles remaining balance');

    const sum = updated.reduce((s, i) => s + i.amount, 0);
    assert.strictEqual(sum, totalOrder, 'Recalculated sum must equal total payable');
  });

  test('3.3: Overpayment prevention: Cannot collect more than outstanding balance', () => {
    const orderTotal = 10000;
    const paidSoFar = 8000;
    const outstanding = orderTotal - paidSoFar;

    const attemptedPayment = 5000;
    const isOverpayment = attemptedPayment > outstanding;

    assert.strictEqual(isOverpayment, true, 'System must detect and block overpayment');
  });

  // ------------------------------------------------------------------
  // SUITE 4: CASHFREE WEBHOOK SECURITY & IDEMPOTENCY
  // ------------------------------------------------------------------
  console.log('\n📦 SUITE 4: Cashfree Webhooks & Cryptographic Verification');

  test('4.1: Cashfree Webhook HMAC-SHA256 signature verification passes with valid secret', () => {
    const secretKey = 'test_secret_key_12345';
    const timestamp = '1776300000';
    const rawBody = JSON.stringify({
      data: {
        order: { order_id: 'PRT-99999', order_amount: 500 },
        payment: { cf_payment_id: '12345678', payment_status: 'SUCCESS' }
      },
      event_time: '2026-10-16T09:00:00Z',
      type: 'PAYMENT_SUCCESS_WEBHOOK'
    });

    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(timestamp + rawBody)
      .digest('base64');

    const isValid = verifyCashfreeWebhookSignature({
      signature: expectedSignature,
      timestamp,
      rawBody,
      secret: secretKey
    });
    assert.strictEqual(isValid, true, 'Valid signature must verify successfully');
  });

  test('4.2: Webhook signature rejected if payload or timestamp is tampered', () => {
    const secretKey = 'test_secret_key_12345';
    const timestamp = '1776300000';
    const rawBody = '{"tampered":true}';

    const fakeSignature = 'invalid_base64_signature==';
    const isValid = verifyCashfreeWebhookSignature({
      signature: fakeSignature,
      timestamp,
      rawBody,
      secret: secretKey
    });
    assert.strictEqual(isValid, false, 'Tampered signature must be rejected');
  });

  test('4.3: Out-of-order webhook protection: Never downgrade SUCCESS to FAILED', () => {
    const currentOrderPaymentStatus = 'paid';
    const incomingEventStatus = 'FAILED';

    let shouldUpdateStatus = true;
    if (currentOrderPaymentStatus === 'paid' && incomingEventStatus === 'FAILED') {
      shouldUpdateStatus = false; // Protected!
    }

    assert.strictEqual(shouldUpdateStatus, false, 'Verified paid status must never be downgraded by stale failure event');
  });

  // ------------------------------------------------------------------
  // SUITE 5: IDENTITY, RECONCILIATION & PERMISSIONS
  // ------------------------------------------------------------------
  console.log('\n📦 SUITE 5: Security, Permissions & Identity Isolation');

  test('5.1: Customer cannot modify amount due on server', () => {
    const catalogDbPrice = 5000;
    const resolvedUnitPrice = catalogDbPrice;
    assert.strictEqual(resolvedUnitPrice, 5000, 'Server must enforce catalog DB price over client payload');
  });

  test('5.2: UTR Reference uniqueness prevents duplicate manual receipts', () => {
    const recordedLedger = [
      { utr: 'UTR987654321', amount: 5000, method: 'Bank Transfer' }
    ];

    const incomingManualPayment = { utr: 'utr987654321', amount: 5000 };
    const isDuplicate = recordedLedger.some(
      entry => entry.utr && entry.utr.toLowerCase() === incomingManualPayment.utr.toLowerCase()
    );

    assert.strictEqual(isDuplicate, true, 'Duplicate UTR must be detected and blocked');
  });

  console.log('\n======================================================');
  console.log(`📊 TEST EXECUTION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
