import { adminDb } from './_services/firebaseAdmin.js';
import { getCashfreeOrderPayments } from './_services/cashfreeService.js';
import { triggerOrderConfirmationEmail } from './send-order-email.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST,GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const cfOrderId = req.method === 'POST' ? req.body.cfOrderId : req.query.cfOrderId;
    const orderNumber = req.method === 'POST' ? req.body.orderNumber : req.query.orderNumber;
    const internalOrderId = req.method === 'POST' ? req.body.internalOrderId : req.query.internalOrderId;

    if (!cfOrderId && !orderNumber && !internalOrderId) {
      return res.status(400).json({ error: 'Missing required order or Cashfree order reference.' });
    }

    if (!adminDb) {
      return res.status(500).json({ error: 'Database service not available.' });
    }

    // 1. Locate the pending session or existing order in Firestore
    let sourceDocRef = null;
    let orderData = null;
    let isFromCheckoutSession = false;

    // First check checkout_sessions
    if (internalOrderId) {
      const snap = await adminDb.collection('checkout_sessions').doc(internalOrderId).get();
      if (snap.exists) {
        sourceDocRef = snap.ref;
        orderData = snap.data();
        isFromCheckoutSession = true;
      }
    }

    if (!sourceDocRef && orderNumber) {
      const snap = await adminDb.collection('checkout_sessions')
        .where('orderNumber', '==', orderNumber)
        .limit(1)
        .get();
      if (!snap.empty) {
        sourceDocRef = snap.docs[0].ref;
        orderData = snap.docs[0].data();
        isFromCheckoutSession = true;
      }
    }

    if (!sourceDocRef && cfOrderId) {
      const snap = await adminDb.collection('checkout_sessions')
        .where('paymentProviderOrderId', '==', cfOrderId)
        .limit(1)
        .get();
      if (!snap.empty) {
        sourceDocRef = snap.docs[0].ref;
        orderData = snap.docs[0].data();
        isFromCheckoutSession = true;
      }
    }

    // Fallback: check orders collection (for already confirmed orders or retry verification)
    if (!sourceDocRef && internalOrderId) {
      const snap = await adminDb.collection('orders').doc(internalOrderId).get();
      if (snap.exists) {
        sourceDocRef = snap.ref;
        orderData = snap.data();
      }
    }

    if (!sourceDocRef && orderNumber) {
      const snap = await adminDb.collection('orders')
        .where('orderNumber', '==', orderNumber)
        .limit(1)
        .get();
      if (!snap.empty) {
        sourceDocRef = snap.docs[0].ref;
        orderData = snap.docs[0].data();
      }
    }

    if (!sourceDocRef && cfOrderId) {
      const snap = await adminDb.collection('orders')
        .where('paymentProviderOrderId', '==', cfOrderId)
        .limit(1)
        .get();
      if (!snap.empty) {
        sourceDocRef = snap.docs[0].ref;
        orderData = snap.docs[0].data();
      }
    }

    if (!sourceDocRef || !orderData) {
      return res.status(404).json({ error: 'Checkout session or order not found in database.' });
    }

    const effectiveCfOrderId = cfOrderId || orderData.paymentProviderOrderId || orderData.activePaymentAttempt?.cfOrderId;
    if (!effectiveCfOrderId) {
      return res.status(400).json({ error: 'No Cashfree order reference associated with this order.' });
    }

    // 2. Query Cashfree Payments API for true payment status
    let cfPayments = [];
    try {
      cfPayments = await getCashfreeOrderPayments(effectiveCfOrderId);
    } catch (cfErr) {
      console.warn(`[Verify Cashfree] API fetch note for ${effectiveCfOrderId}:`, cfErr.message);
      return res.status(200).json({
        success: false,
        status: 'PENDING',
        message: 'Payment verification is pending response from gateway.',
        order: {
          orderNumber: orderData.orderNumber || orderData.orderId,
          status: orderData.status,
          paymentStatus: orderData.paymentStatus
        }
      });
    }

    // 3. Find confirmed successful payment attempt
    const successfulPayment = cfPayments.find(p => p.payment_status === 'SUCCESS');
    const pendingPayment = cfPayments.find(p => p.payment_status === 'PENDING');
    const failedPayment = cfPayments.find(p => p.payment_status === 'FAILED');

    if (!successfulPayment) {
      const currentStatus = pendingPayment ? 'PENDING' : (failedPayment ? 'FAILED' : 'UNCONFIRMED');
      return res.status(200).json({
        success: false,
        status: currentStatus,
        message: currentStatus === 'PENDING'
          ? 'Payment is currently being processed by your bank/gateway.'
          : 'No successful payment recorded for this attempt.',
        order: {
          orderNumber: orderData.orderNumber || orderData.orderId,
          status: orderData.status,
          paymentStatus: orderData.paymentStatus
        }
      });
    }

    // 4. Validate payment details
    const cfPaymentId = String(successfulPayment.cf_payment_id || successfulPayment.payment_id || `cf_tx_${Date.now()}`);
    const amountReceived = Number(successfulPayment.payment_amount) || Number(orderData.pricing?.advancePaymentAmount || 0);
    const paymentTime = successfulPayment.payment_completion_time || successfulPayment.payment_time || new Date().toISOString();
    const paymentMethodGroup = successfulPayment.payment_group || successfulPayment.payment_method || 'Cashfree Online';

    // 5. Update Order and Installments atomically in Firestore
    const paymentsLedger = orderData.paymentsLedger || [];
    const alreadyRecorded = paymentsLedger.some(entry => String(entry.cfPaymentId) === cfPaymentId);

    if (!alreadyRecorded) {
      const grandTotal = Number(orderData.pricing?.grandTotal || orderData.totalAmount || 0);
      const priorTotalPaid = Number(orderData.totalPaid || 0);
      const newTotalPaid = priorTotalPaid + amountReceived;
      const outstandingBalance = Math.max(0, grandTotal - newTotalPaid);

      // Target installment: Default to installment 1 (advance), or target specific installment
      const updatedInstallments = (orderData.installments || []).map((inst, idx) => {
        if (idx === 0 || inst.status === 'Due') {
          return {
            ...inst,
            status: 'Paid',
            paidAmount: amountReceived,
            paymentMethod: paymentMethodGroup,
            transactionId: cfPaymentId,
            paidAt: paymentTime
          };
        }
        return inst;
      });

      const newLedgerEntry = {
        paymentId: `pay_${Date.now()}_${cfPaymentId}`,
        installmentId: updatedInstallments[0]?.installmentId || 'inst_1',
        source: 'cashfree',
        amount: amountReceived,
        currency: 'INR',
        status: 'SUCCESS',
        cfPaymentId,
        providerOrderId: effectiveCfOrderId,
        method: paymentMethodGroup,
        recordedBy: 'cashfree_verification',
        timestamp: paymentTime
      };

      const updatedAttempts = (orderData.paymentAttempts || []).map(att => {
        if (att.cfOrderId === effectiveCfOrderId) {
          return { ...att, status: 'SUCCESS', cfPaymentId, verifiedAt: new Date().toISOString() };
        }
        return att;
      });

      const paymentStatus = outstandingBalance <= 0 ? 'paid' : 'Advance Paid';
      const orderLifecycleStatus = 'Payment Confirmed';

      const updatePayload = {
        totalPaid: newTotalPaid,
        outstandingBalance,
        installments: updatedInstallments,
        paymentsLedger: [...paymentsLedger, newLedgerEntry],
        paymentAttempts: updatedAttempts,
        paymentStatus,
        status: orderLifecycleStatus,
        payment: {
          method: 'cashfree',
          status: paymentStatus,
          cfPaymentId,
          paidAt: paymentTime
        },
        auditTrail: [
          ...(orderData.auditTrail || []),
          {
            action: 'ONLINE_PAYMENT_VERIFIED',
            changedBy: 'Cashfree Gateway Verification',
            details: `Verified ₹${amountReceived} received (Transaction ID: ${cfPaymentId}). Remaining balance: ₹${outstandingBalance}`,
            timestamp: new Date().toISOString()
          }
        ],
        updatedAt: new Date().toISOString()
      };

      let finalOrderDocRef;
      if (isFromCheckoutSession) {
        // Promote checkout session to confirmed order in 'orders' collection
        const confirmedOrder = {
          ...orderData,
          ...updatePayload,
          isPendingCheckout: false,
          status: 'Payment Confirmed',
          confirmedAt: new Date().toISOString()
        };
        const targetDocId = orderData.orderNumber || orderData.id || `PRT-${Date.now()}`;
        finalOrderDocRef = adminDb.collection('orders').doc(targetDocId);
        await finalOrderDocRef.set(confirmedOrder);
        await sourceDocRef.update({
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
          confirmedOrderId: finalOrderDocRef.id
        });
        orderData = confirmedOrder;
      } else {
        await sourceDocRef.update({ ...updatePayload, isPendingCheckout: false, status: 'Payment Confirmed' });
        finalOrderDocRef = sourceDocRef;
        orderData = { ...orderData, ...updatePayload, isPendingCheckout: false, status: 'Payment Confirmed' };
      }

      // Proactively trigger customer & admin confirmation emails
      try {
        await triggerOrderConfirmationEmail(orderData.orderNumber || orderData.orderId, finalOrderDocRef.id);
      } catch (e) {
        console.warn('[Verify Cashfree] Order email notice:', e.message);
      }
    }

    const finalOrderId = isFromCheckoutSession ? (orderData.orderNumber || orderData.id) : sourceDocRef.id;

    // 6. Return verified result
    return res.status(200).json({
      success: true,
      status: 'SUCCESS',
      transactionId: cfPaymentId,
      amountReceived,
      currency: 'INR',
      paymentTime,
      order: {
        id: finalOrderId,
        orderNumber: orderData.orderNumber || orderData.orderId,
        status: orderData.status,
        paymentStatus: orderData.paymentStatus,
        totalAmount: orderData.pricing?.grandTotal || orderData.totalAmount,
        totalPaid: orderData.totalPaid,
        outstandingBalance: orderData.outstandingBalance,
        pricing: orderData.pricing,
        items: orderData.items,
        installments: orderData.installments,
        customer: orderData.customer,
        shippingAddress: orderData.shippingAddress
      }
    });

  } catch (err) {
    console.error('[Verify Cashfree Payment Fatal Error]', err);
    return res.status(500).json({
      error: 'Failed to verify payment with Cashfree.',
      details: err.message
    });
  }
}
