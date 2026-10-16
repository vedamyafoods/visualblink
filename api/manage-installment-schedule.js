import { adminDb } from './_services/firebaseAdmin.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const {
      orderId,
      installments: newInstallments,
      adminEmail = 'Admin User',
      actionNotes = 'Administrator updated installment schedule.'
    } = req.body || {};

    if (!orderId || !Array.isArray(newInstallments) || newInstallments.length === 0) {
      return res.status(400).json({ error: 'Order ID and a valid list of installments are required.' });
    }

    if (!adminDb) {
      return res.status(500).json({ error: 'Database service not available.' });
    }

    let orderDocRef = adminDb.collection('orders').doc(orderId);
    let orderSnap = await orderDocRef.get();

    if (!orderSnap.exists) {
      const q = await adminDb.collection('orders').where('orderNumber', '==', orderId).limit(1).get();
      if (!q.empty) {
        orderDocRef = q.docs[0].ref;
        orderSnap = q.docs[0];
      } else {
        return res.status(404).json({ error: `Order #${orderId} not found.` });
      }
    }

    const orderData = orderSnap.data();
    const grandTotal = Number(orderData.pricing?.grandTotal || orderData.totalAmount || 0);
    const existingInstallments = orderData.installments || [];

    // 1. Integrity Check: Never modify historical paid installments!
    for (const oldInst of existingInstallments) {
      if (oldInst.status === 'Paid') {
        const matchingNew = newInstallments.find(ni => ni.installmentId === oldInst.installmentId);
        if (!matchingNew) {
          return res.status(400).json({
            error: `Cannot remove previously paid installment "${oldInst.name}" (ID: ${oldInst.installmentId}).`
          });
        }
        if (Number(matchingNew.paidAmount) !== Number(oldInst.paidAmount) || matchingNew.status !== 'Paid') {
          return res.status(400).json({
            error: `Historical paid amounts are immutable. Cannot alter paid installment "${oldInst.name}".`
          });
        }
      }
    }

    // 2. Validate sum of all installments equals grandTotal
    let totalAllocated = 0;
    const validatedSchedule = newInstallments.map((inst, idx) => {
      const amount = Math.max(0, Math.round(Number(inst.amount) || 0));
      totalAllocated += amount;
      return {
        installmentId: inst.installmentId || `inst_${Date.now()}_${idx + 1}`,
        seq: idx + 1,
        name: inst.name || `Installment #${idx + 1}`,
        description: inst.description || '',
        amount,
        percentage: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
        dueDate: inst.dueDate || new Date().toISOString(),
        status: inst.status || 'Due',
        paidAmount: inst.paidAmount || 0,
        paymentMethod: inst.paymentMethod || null,
        transactionId: inst.transactionId || null,
        paidAt: inst.paidAt || null,
        notes: inst.notes || ''
      };
    });

    // Check discrepancy
    const difference = grandTotal - totalAllocated;
    if (Math.abs(difference) > 0) {
      // Reconcile rounding discrepancy to the last unpaid installment
      const lastUnpaidIdx = validatedSchedule.findLastIndex(i => i.status !== 'Paid');
      if (lastUnpaidIdx !== -1) {
        validatedSchedule[lastUnpaidIdx].amount += difference;
        validatedSchedule[lastUnpaidIdx].percentage = Math.round((validatedSchedule[lastUnpaidIdx].amount / grandTotal) * 100);
      } else {
        return res.status(400).json({
          error: `Installment allocation sum (₹${totalAllocated.toLocaleString()}) must exactly equal the order total (₹${grandTotal.toLocaleString()}).`
        });
      }
    }

    const auditEntry = {
      action: 'INSTALLMENT_SCHEDULE_RECONFIGURED',
      changedBy: adminEmail,
      details: `${actionNotes} Reconfigured into ${validatedSchedule.length} installment(s).`,
      timestamp: new Date().toISOString()
    };

    await orderDocRef.update({
      installments: validatedSchedule,
      auditTrail: [...(orderData.auditTrail || []), auditEntry],
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Installment schedule updated and reconciled successfully.',
      installments: validatedSchedule
    });

  } catch (err) {
    console.error('[Manage Installment Schedule Error]', err);
    return res.status(500).json({ error: 'Failed to update installment schedule.', details: err.message });
  }
}
