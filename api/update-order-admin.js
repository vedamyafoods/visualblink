import { adminDb } from './_services/firebaseAdmin.js';
import { mailService } from './_services/mailService.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { orderId, newStatus } = req.body;
        if (!orderId || !newStatus) return res.status(400).json({ error: 'Missing orderId or newStatus' });

        if (!adminDb) return res.status(500).json({ error: 'Firebase Admin not initialized' });

        // Step 1: Query order
        const orderRef = adminDb.collection('orders').doc(orderId);
        const snap = await orderRef.get();
        if (!snap.exists) return res.status(404).json({ error: 'Order not found' });
        const orderData = snap.data();

        // Step 2: Prepare history
        const history = orderData.statusHistory || [];
        history.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            updatedBy: 'Admin'
        });

        // Step 3: Check if Dispatched to handle Remaining 50%
        const isDispatched = newStatus === 'Dispatched';
        let finalPaymentLink = '';

        // We can direct them to the account page to pay the remaining
        const accountUrl = `${process.env.APP_BASE_URL || 'https://visualblink.com'}/account?track=${orderData.orderId || orderId}`;

        // Step 4: Save to Firestore
        await orderRef.update({
            status: newStatus,
            statusHistory: history,
            updatedAt: new Date().toISOString()
        });

        // Step 5: Send Dispatch Email if required
        if (isDispatched) {
            const customerEmail = orderData.customer?.email || orderData.customerEmail;
            if (customerEmail && !orderData.finalPaymentNotificationSent) {
                let remainingStr = '';
                if (orderData.pricing?.remainingPaymentAmount > 0 && orderData.paymentStatus !== 'Fully Paid') {
                    remainingStr = `<h3 style="color:#ef4444;">Action Required: 50% Final Payment Pending</h3>
            <p>Your order is ready to dispatch! Please clear the remaining balance of <strong>₹${orderData.pricing.remainingPaymentAmount}</strong>.</p>
            <a href="${accountUrl}" style="background-color:#0ea5e9; color:white; padding:10px 16px; border-radius:5px; text-decoration:none; display:inline-block; font-weight:bold;">Pay Remaining Balance & Track Order</a>`;
                } else {
                    remainingStr = `<p>Track your order status live on your account dashboard:</p>
            <a href="${accountUrl}" style="background-color:#0ea5e9; color:white; padding:10px 16px; border-radius:5px; text-decoration:none; display:inline-block; font-weight:bold;">Track Order</a>`;
                }

                const emailHtml = `
          <div style="font-family:sans-serif; padding:20px; color:#333;">
            <h2 style="color:#10b981;">Order Dispatched: #${orderData.orderId || orderId}</h2>
            <p>Hi ${orderData.customer?.name || 'Customer'},</p>
            <p>Your print order has progressed to the <strong>Dispatched</strong> stage.</p>
            ${remainingStr}
            <p style="margin-top:20px; font-size:12px; color:#666;">VisualBlink Print Studio</p>
          </div>
        `;

                try {
                    await mailService.sendOrderConfirmation(customerEmail, `${orderData.orderId || orderId} - Dispatched`, emailHtml);
                    await orderRef.update({ finalPaymentNotificationSent: true });
                } catch (e) {
                    console.error('Failed to send dispatch email', e);
                }
            }
        }

        return res.status(200).json({ success: true, message: 'Order status updated successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update order status' });
    }
}
