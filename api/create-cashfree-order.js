import crypto from 'crypto';

const CF_ENV = process.env.CASHFREE_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
const CF_API = CF_ENV === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { amount, customerId, customerName, customerEmail, customerPhone, returnUrl } = req.body;

        if (!amount || !customerPhone) {
            return res.status(400).json({ error: 'Missing required parameters.' });
        }

        const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        const payload = {
            order_id: orderId,
            order_amount: amount,
            order_currency: 'INR',
            customer_details: {
                customer_id: customerId || `cust_${Date.now()}`,
                customer_name: customerName || 'Guest User',
                customer_email: customerEmail || 'guest@example.com',
                customer_phone: customerPhone
            },
            order_meta: {
                return_url: returnUrl || `${process.env.APP_BASE_URL || 'http://localhost:5173'}/checkout-callback?order_id={order_id}`
            }
        };

        const response = await fetch(`${CF_API}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': process.env.CASHFREE_CLIENT_ID,
                'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
                'x-api-version': process.env.CASHFREE_API_VERSION || '2023-08-01'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Cashfree API Error:', data);
            throw new Error(data.message || 'Failed to create Cashfree order');
        }

        return res.status(200).json({
            success: true,
            orderId: data.order_id,
            paymentSessionId: data.payment_session_id
        });

    } catch (err) {
        console.error('Create Cashfree Order Error:', err);
        return res.status(500).json({ error: 'Failed to initiate secure online payment.', details: err.message });
    }
}
