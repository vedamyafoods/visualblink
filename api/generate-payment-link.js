import { adminDb } from './_services/firebaseAdmin.js';
import { createCashfreePaymentLink } from './_services/cashfreeService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { orderId, installmentId, customAmount, expiryDays = 3, adminEmail = 'admin@visualblink.com' } = req.body || {};

    if (!orderId || !installmentId) {
      return res.status(400).json({ error: 'Order ID and Installment ID are required.' });
    }

    if (!adminDb) {
      return res.status(500).json({ error: 'Database service not available.' });
    }

    // 1. Fetch Order from Firestore
    let orderDocRef = adminDb.collection('orders').doc(orderId);
    let orderSnap = await orderDocRef.get();

    if (!orderSnap.exists) {
      // Try searching by orderNumber
      const q = await adminDb.collection('orders').where('orderNumber', '==', orderId).limit(1).get();
      if (!q.empty) {
        orderDocRef = q.docs[0].ref;
        orderSnap = q.docs[0];
      } else {
        return res.status(404).json({ error: `Order #${orderId} not found.` });
      }
    }

    const orderData = orderSnap.data();
    const installments = orderData.installments || [];
    const targetInstallmentIndex = installments.findIndex(i => i.installmentId === installmentId);

    if (targetInstallmentIndex === -1) {
      return res.status(404).json({ error: `Installment ${installmentId} not found on this order.` });
    }

    const targetInstallment = installments[targetInstallmentIndex];

    if (targetInstallment.status === 'Paid') {
      return res.status(400).json({ error: 'Cannot generate payment link for an already paid installment.' });
    }

    // 2. Calculate remaining collectible amount
    const outstandingBalance = Number(orderData.outstandingBalance ?? (orderData.pricing?.grandTotal || orderData.totalAmount || 0));
    const rawTargetAmount = customAmount ? Number(customAmount) : Number(targetInstallment.amount || 0);
    const linkAmount = Math.min(rawTargetAmount, outstandingBalance);

    if (linkAmount <= 0) {
      return res.status(400).json({ error: 'Outstanding balance is already zero.' });
    }

    const customer = orderData.customer || {};
    const cleanPhone = (customer.phone || '').replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'A valid customer 10-digit mobile number is required to generate payment link.' });
    }

    // 3. Create unique Cashfree Payment Link
    const uniqueLinkId = `link_${orderData.orderNumber || orderSnap.id}_${installmentId}_${Date.now()}`;
    const returnUrl = `${process.env.APP_BASE_URL || 'http://localhost:5173'}/payment-callback?order_id=${orderData.orderNumber || orderSnap.id}&link_id=${uniqueLinkId}`;

    let cfLinkResult;
    try {
      cfLinkResult = await createCashfreePaymentLink({
        linkId: uniqueLinkId,
        linkAmount,
        linkCurrency: 'INR',
        linkPurpose: `${targetInstallment.name || 'Installment Payment'} - Order #${orderData.orderNumber || orderSnap.id}`,
        customer: {
          phone: cleanPhone,
          name: customer.name || 'Valued Client',
          email: customer.email || 'client@example.com'
        },
        returnUrl,
        notifyUrl: `${process.env.APP_BASE_URL || 'https://visualblink.com'}/api/cashfree-webhook`,
        expiryMinutes: Math.max(60, expiryDays * 24 * 60)
      });
    } catch (cfErr) {
      console.error('[Cashfree Link Generation Error]', cfErr);
      return res.status(502).json({
        error: 'Failed to create payment link on Cashfree.',
        details: cfErr.message
      });
    }

    // 4. Update order with payment link metadata
    const newPaymentLink = {
      internalId: `plink_${Date.now()}`,
      orderId: orderSnap.id,
      orderNumber: orderData.orderNumber || orderSnap.id,
      installmentId,
      cfLinkId: cfLinkResult.linkId,
      linkUrl: cfLinkResult.linkUrl,
      amount: linkAmount,
      currency: 'INR',
      status: cfLinkResult.linkStatus || 'ACTIVE',
      expiryTime: cfLinkResult.linkExpiryTime,
      createdBy: adminEmail,
      createdAt: new Date().toISOString()
    };

    // Update the installment record to attach this payment link
    const updatedInstallments = [...installments];
    updatedInstallments[targetInstallmentIndex] = {
      ...targetInstallment,
      paymentLinkId: cfLinkResult.linkId,
      paymentLinkUrl: cfLinkResult.linkUrl,
      status: targetInstallment.status === 'Upcoming' ? 'Due' : targetInstallment.status
    };

    const existingLinks = orderData.paymentLinks || [];

    await orderDocRef.update({
      installments: updatedInstallments,
      paymentLinks: [...existingLinks, newPaymentLink],
      auditTrail: [
        ...(orderData.auditTrail || []),
        {
          action: 'PAYMENT_LINK_GENERATED',
          changedBy: adminEmail,
          details: `Generated Cashfree payment link for ₹${linkAmount} on installment "${targetInstallment.name}". Link: ${cfLinkResult.linkUrl}`,
          timestamp: new Date().toISOString()
        }
      ],
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      linkUrl: cfLinkResult.linkUrl,
      linkId: cfLinkResult.linkId,
      linkAmount,
      expiryTime: cfLinkResult.linkExpiryTime,
      installment: updatedInstallments[targetInstallmentIndex]
    });

  } catch (err) {
    console.error('[Generate Payment Link API Error]', err);
    return res.status(500).json({ error: 'Failed to process payment link generation.', details: err.message });
  }
}
