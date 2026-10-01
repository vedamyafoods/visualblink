import { adminDb } from './_services/firebaseAdmin.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const signature = req.headers['x-api-key'];
        // In Shiprocket, you configure an API key for the webhook, and it's sent in headers

        if (process.env.WEBHOOK_SECRET && signature !== process.env.WEBHOOK_SECRET) {
            console.warn('Shiprocket Invalid Webhook Signature');
            return res.status(401).send('Unauthorized');
        }

        const payload = req.body;

        // Shiprocket payload structure e.g.
        // { "awb": "12345", "current_status": "DELIVERED", "order_id": "PRT-XXXXX" }

        const { awb, current_status, order_id } = payload;

        if (!awb && !order_id) {
            return res.status(400).send('Invalid payload');
        }

        if (adminDb && order_id) {
            const q = await adminDb.collection('orders').where('orderId', '==', order_id).limit(1).get();

            if (!q.empty) {
                const docId = q.docs[0].id;
                let friendlyStatus = 'Processing';

                const lowerStatus = (current_status || '').toLowerCase();
                if (lowerStatus.includes('delivered')) friendlyStatus = 'Delivered';
                else if (lowerStatus.includes('shipped') || lowerStatus.includes('transit')) friendlyStatus = 'Shipped';
                else if (lowerStatus.includes('canceled') || lowerStatus.includes('cancelled')) friendlyStatus = 'Cancelled';

                await adminDb.collection('orders').doc(docId).update({
                    shippingStatus: current_status,
                    status: friendlyStatus,
                    awb: awb,
                    updatedAt: new Date().toISOString()
                });
                console.log(`Updated order ${order_id} status to ${friendlyStatus} from Shiprocket Webhook`);
            }
        }

        return res.status(200).send('OK');
    } catch (err) {
        console.error('Shiprocket Webhook error:', err);
        return res.status(500).send('Internal Server Error');
    }
}
