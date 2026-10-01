import crypto from 'crypto';
import { adminDb } from './_services/firebaseAdmin.js';
import { mailService } from './_services/mailService.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const signature = req.headers['x-webhook-signature'];
        const timestamp = req.headers['x-webhook-timestamp'];
        const secret = process.env.CASHFREE_CLIENT_SECRET;

        if (!signature || !timestamp || !secret) {
            return res.status(400).send('Missing signature or secret');
        }

        // Verify Signature
        const bodyStr = JSON.stringify(req.body);
        const dataAuth = timestamp + bodyStr;
        const computedSignature = crypto.createHmac('sha256', secret).update(dataAuth).digest('base64');

        if (computedSignature !== signature) {
            console.warn('Cashfree Invalid Webhook Signature');
            return res.status(400).send('Invalid signature');
        }

        const event = req.body;
        if (event.type === 'PAYMENT_SUCCESS_WEBHOOK') {
            const paymentData = event.data;
            const { order_id, payment_status } = paymentData.payment;

            if (payment_status === 'SUCCESS' && adminDb) {
                // Query our orders for this razorpay/cashfree order ID
                const q = await adminDb.collection('orders').where('paymentProviderOrderId', '==', order_id).limit(1).get();
                if (!q.empty) {
                    const docId = q.docs[0].id;
                    await adminDb.collection('orders').doc(docId).update({
                        paymentStatus: 'paid',
                        updatedAt: new Date().toISOString()
                    });
                    console.log(`Payment confirmed for order ${docId} via Cashfree Webhook`);
                }
            }
        }

        return res.status(200).send('OK');
    } catch (err) {
        console.error('Webhook error:', err);
        return res.status(500).send('Internal Server Error');
    }
}
