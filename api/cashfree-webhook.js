import crypto from 'crypto';
import { adminDb } from './_services/firebaseAdmin.js';
import { verifyCashfreeWebhookSignature } from './_services/cashfreeService.js';
import { triggerOrderConfirmationEmail } from './send-order-email.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    // 1. Signature Verification
    const isSignatureValid = verifyCashfreeWebhookSignature({
      signature,
      timestamp,
      rawBody
    });

    // In production, reject invalid signatures immediately.
    // In local sandbox testing, if no secret is configured yet, allow with a warning log.
    if (!isSignatureValid && process.env.CASHFREE_CLIENT_SECRET) {
      console.warn('[Cashfree Webhook] Invalid or forged webhook signature rejected.');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body || {};
    const eventType = event.type || event.event || 'UNKNOWN';
    const eventTime = event.event_time || new Date().toISOString();
    const eventData = event.data || {};

    const orderObj = eventData.order || {};
    const paymentObj = eventData.payment || {};
    const linkObj = eventData.link_details || eventData.link || {};

    const cfOrderId = orderObj.order_id || paymentObj.order_id || null;
    const cfPaymentId = paymentObj.cf_payment_id ? String(paymentObj.cf_payment_id) : null;
    const paymentStatus = paymentObj.payment_status || (eventType === 'PAYMENT_SUCCESS_WEBHOOK' ? 'SUCCESS' : null);
    const linkId = linkObj.link_id || eventData.link_id || null;

    const deduplicationKey = `wh_${eventType}_${cfPaymentId || cfOrderId || linkId || Date.now()}`;

    // 2. Idempotent Deduplication Check in Firestore
    if (adminDb) {
      const whDocRef = adminDb.collection('webhookEvents').doc(deduplicationKey);
      const whSnap = await whDocRef.get();
      if (whSnap.exists) {
        console.log(`[Cashfree Webhook] Duplicate delivery skipped for key: ${deduplicationKey}`);
        return res.status(200).send('ALREADY_PROCESSED');
      }

      // Record incoming event
      await whDocRef.set({
        deduplicationKey,
        eventType,
        cfOrderId,
        cfPaymentId,
        paymentStatus,
        linkId,
        receivedAt: new Date().toISOString(),
        status: 'PROCESSING'
      });
    }

    // 3. Locate Target Order or Checkout Session
    let targetOrderRef = null;
    let targetOrderData = null;
    let isFromCheckoutSession = false;

    if (adminDb && (cfOrderId || linkId)) {
      if (cfOrderId) {
        const q = await adminDb.collection('orders')
          .where('paymentProviderOrderId', '==', cfOrderId)
          .limit(1)
          .get();
        if (!q.empty) {
          targetOrderRef = q.docs[0].ref;
          targetOrderData = q.docs[0].data();
        }
      }

      // If not found by provider order ID, search in payment attempts
      if (!targetOrderRef && cfOrderId) {
        const match = cfOrderId.match(/cf_(PRT-\d+)/);
        if (match) {
          const orderNum = match[1];
          const q = await adminDb.collection('orders')
            .where('orderNumber', '==', orderNum)
            .limit(1)
            .get();
          if (!q.empty) {
            targetOrderRef = q.docs[0].ref;
            targetOrderData = q.docs[0].data();
          }
        }
      }

      // If this is a payment link event, find the order mapped to this payment link
      if (!targetOrderRef && linkId) {
        const q = await adminDb.collection('orders')
          .where('paymentLinks', 'array-contains-any', [{ cfLinkId: linkId }])
          .limit(1)
          .get();
        if (!q.empty) {
          targetOrderRef = q.docs[0].ref;
          targetOrderData = q.docs[0].data();
        }
      }

      // If not found in orders, check checkout_sessions
      if (!targetOrderRef && cfOrderId) {
        const q = await adminDb.collection('checkout_sessions')
          .where('paymentProviderOrderId', '==', cfOrderId)
          .limit(1)
          .get();
        if (!q.empty) {
          targetOrderRef = q.docs[0].ref;
          targetOrderData = q.docs[0].data();
          isFromCheckoutSession = true;
        }
      }

      if (!targetOrderRef && cfOrderId) {
        const match = cfOrderId.match(/cf_(PRT-\d+)/);
        if (match) {
          const orderNum = match[1];
          const q = await adminDb.collection('checkout_sessions')
            .where('orderNumber', '==', orderNum)
            .limit(1)
            .get();
          if (!q.empty) {
            targetOrderRef = q.docs[0].ref;
            targetOrderData = q.docs[0].data();
            isFromCheckoutSession = true;
          }
        }
      }
    }

    if (!targetOrderRef || !targetOrderData) {
      console.warn(`[Cashfree Webhook] Order not found for cfOrderId: ${cfOrderId}, linkId: ${linkId}`);
      if (adminDb) {
        await adminDb.collection('webhookEvents').doc(deduplicationKey).update({
          status: 'ORDER_NOT_FOUND',
          updatedAt: new Date().toISOString()
        });
      }
      return res.status(200).send('ORDER_NOT_FOUND_ACK');
    }

    // 4. Handle Event by Type
    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || paymentStatus === 'SUCCESS') {
      const amountReceived = Number(paymentObj.payment_amount) || Number(targetOrderData.pricing?.advancePaymentAmount || 0);
      const paymentTime = paymentObj.payment_completion_time || paymentObj.payment_time || new Date().toISOString();
      const paymentMethod = paymentObj.payment_group || paymentObj.payment_method || 'Cashfree Online';

      const existingLedger = targetOrderData.paymentsLedger || [];
      const isAlreadyRecorded = existingLedger.some(e => String(e.cfPaymentId) === String(cfPaymentId));

      if (!isAlreadyRecorded) {
        const grandTotal = Number(targetOrderData.pricing?.grandTotal || targetOrderData.totalAmount || 0);
        const priorTotalPaid = Number(targetOrderData.totalPaid || 0);
        const newTotalPaid = priorTotalPaid + amountReceived;
        const outstandingBalance = Math.max(0, grandTotal - newTotalPaid);

        // Update target installment
        const updatedInstallments = (targetOrderData.installments || []).map((inst, idx) => {
          if (idx === 0 || inst.status === 'Due') {
            return {
              ...inst,
              status: 'Paid',
              paidAmount: amountReceived,
              paymentMethod,
              transactionId: cfPaymentId,
              paidAt: paymentTime
            };
          }
          return inst;
        });

        const newLedgerEntry = {
          paymentId: `pay_${Date.now()}_${cfPaymentId || 'wh'}`,
          installmentId: updatedInstallments[0]?.installmentId || 'inst_1',
          source: 'cashfree',
          amount: amountReceived,
          currency: 'INR',
          status: 'SUCCESS',
          cfPaymentId,
          providerOrderId: cfOrderId,
          method: paymentMethod,
          recordedBy: 'cashfree_webhook',
          timestamp: paymentTime
        };

        const paymentStatus = outstandingBalance <= 0 ? 'paid' : 'Advance Paid';

        const updatePayload = {
          totalPaid: newTotalPaid,
          outstandingBalance,
          installments: updatedInstallments,
          paymentsLedger: [...existingLedger, newLedgerEntry],
          paymentStatus,
          status: 'Payment Confirmed',
          isPendingCheckout: false,
          payment: {
            method: 'cashfree',
            status: paymentStatus,
            cfPaymentId,
            paidAt: paymentTime
          },
          auditTrail: [
            ...(targetOrderData.auditTrail || []),
            {
              action: 'WEBHOOK_PAYMENT_CONFIRMED',
              changedBy: 'Cashfree Webhook',
              details: `Confirmed ₹${amountReceived} payment via Cashfree webhook (CF Tx: ${cfPaymentId}). Outstanding: ₹${outstandingBalance}`,
              timestamp: new Date().toISOString()
            }
          ],
          updatedAt: new Date().toISOString()
        };

        let finalOrderDocRef;
        if (isFromCheckoutSession) {
          const confirmedOrder = {
            ...targetOrderData,
            ...updatePayload,
            isPendingCheckout: false,
            status: 'Payment Confirmed',
            confirmedAt: new Date().toISOString()
          };
          const targetDocId = targetOrderData.orderNumber || targetOrderData.id || `PRT-${Date.now()}`;
          finalOrderDocRef = adminDb.collection('orders').doc(targetDocId);
          await finalOrderDocRef.set(confirmedOrder);
          await targetOrderRef.update({
            status: 'COMPLETED',
            completedAt: new Date().toISOString(),
            confirmedOrderId: finalOrderDocRef.id
          });
        } else {
          await targetOrderRef.update({ ...updatePayload, isPendingCheckout: false, status: 'Payment Confirmed' });
          finalOrderDocRef = targetOrderRef;
        }

        // Trigger confirmation email if not yet sent
        try {
          await triggerOrderConfirmationEmail(targetOrderData.orderNumber || targetOrderData.orderId, finalOrderDocRef.id);
        } catch (e) {
          console.warn('[Webhook] Confirmation email notice:', e.message);
        }
      }
    } else if (eventType === 'PAYMENT_FAILED_WEBHOOK' || paymentStatus === 'FAILED') {
      // Out-of-order guard: Never downgrade a confirmed payment!
      const currentPayStatus = targetOrderData.paymentStatus;
      if (currentPayStatus !== 'paid' && currentPayStatus !== 'Advance Paid') {
        const failureReason = paymentObj.payment_message || 'Payment attempt failed or declined by customer bank.';
        await targetOrderRef.update({
          paymentStatus: 'failed',
          lastPaymentFailureReason: failureReason,
          auditTrail: [
            ...(targetOrderData.auditTrail || []),
            {
              action: 'WEBHOOK_PAYMENT_FAILED',
              changedBy: 'Cashfree Webhook',
              details: `Payment failure event received: ${failureReason}`,
              timestamp: new Date().toISOString()
            }
          ],
          updatedAt: new Date().toISOString()
        });
      }
    }

    // 5. Update Webhook processing outcome
    if (adminDb) {
      await adminDb.collection('webhookEvents').doc(deduplicationKey).update({
        status: 'SUCCESS',
        processedAt: new Date().toISOString(),
        orderId: targetOrderRef.id
      });
    }

    return res.status(200).send('OK');

  } catch (err) {
    console.error('[Cashfree Webhook Handler Error]', err);
    return res.status(500).send('Internal Server Error');
  }
}
