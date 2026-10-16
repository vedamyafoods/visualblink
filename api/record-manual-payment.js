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
      installmentId,
      amount,
      paymentMethod = 'Bank Transfer', // Bank Transfer, UPI, Cash, Cheque, Other
      utrReference = '',
      paymentDate,
      receiptUrl = '',
      notes = '',
      recordedBy = 'Admin User'
    } = req.body || {};

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required.' });
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid payment amount greater than zero.' });
    }

    if (!adminDb) {
      return res.status(500).json({ error: 'Database service not available.' });
    }

    // 1. Fetch Order
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
    const priorTotalPaid = Number(orderData.totalPaid || 0);
    const currentOutstanding = Math.max(0, grandTotal - priorTotalPaid);

    // Overpayment check
    if (numericAmount > currentOutstanding) {
      return res.status(400).json({
        error: `Amount (₹${numericAmount.toLocaleString()}) exceeds the current outstanding balance of ₹${currentOutstanding.toLocaleString()}. Overcollection is prevented.`
      });
    }

    // Duplicate check on UTR/reference number
    const paymentsLedger = orderData.paymentsLedger || [];
    const cleanUtr = utrReference.trim().toUpperCase();
    if (cleanUtr && cleanUtr !== 'N/A' && cleanUtr !== 'NONE') {
      const isDuplicateUtr = paymentsLedger.some(entry =>
        entry.utrReference && entry.utrReference.trim().toUpperCase() === cleanUtr
      );
      if (isDuplicateUtr) {
        return res.status(409).json({
          error: `Duplicate reference check failed: A payment with UTR/Ref "${cleanUtr}" is already recorded on this order.`
        });
      }
    }

    // 2. Allocate payment to installments
    const installments = [...(orderData.installments || [])];
    let remainingToAllocate = numericAmount;
    let targetInstallmentName = 'Installment Allocation';

    if (installmentId) {
      // Allocate to specific requested installment
      const targetIdx = installments.findIndex(i => i.installmentId === installmentId);
      if (targetIdx !== -1) {
        const inst = installments[targetIdx];
        targetInstallmentName = inst.name || `Installment #${targetIdx + 1}`;
        const newInstPaid = (inst.paidAmount || 0) + remainingToAllocate;
        const isFullyPaid = newInstPaid >= inst.amount;

        installments[targetIdx] = {
          ...inst,
          paidAmount: newInstPaid,
          status: isFullyPaid ? 'Paid' : 'Partially Paid',
          paymentMethod: `Manual: ${paymentMethod}`,
          transactionId: cleanUtr || `MAN-${Date.now()}`,
          paidAt: paymentDate || new Date().toISOString()
        };
      }
    } else {
      // Sequential allocation across unpaid installments
      for (let i = 0; i < installments.length && remainingToAllocate > 0; i++) {
        const inst = installments[i];
        if (inst.status !== 'Paid') {
          const needed = Math.max(0, inst.amount - (inst.paidAmount || 0));
          const allocated = Math.min(needed, remainingToAllocate);
          const newInstPaid = (inst.paidAmount || 0) + allocated;
          const isFullyPaid = newInstPaid >= inst.amount;

          installments[i] = {
            ...inst,
            paidAmount: newInstPaid,
            status: isFullyPaid ? 'Paid' : 'Partially Paid',
            paymentMethod: `Manual: ${paymentMethod}`,
            transactionId: cleanUtr || `MAN-${Date.now()}`,
            paidAt: paymentDate || new Date().toISOString()
          };

          remainingToAllocate -= allocated;
        }
      }
    }

    // 3. Update order totals
    const newTotalPaid = priorTotalPaid + numericAmount;
    const newOutstandingBalance = Math.max(0, grandTotal - newTotalPaid);
    const paymentStatus = newOutstandingBalance <= 0 ? 'paid' : (newTotalPaid > 0 ? 'Advance Paid' : 'pending');

    const paymentTimestamp = paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString();
    const manualPaymentId = `man_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const newLedgerRecord = {
      paymentId: manualPaymentId,
      installmentId: installmentId || installments[0]?.installmentId || 'inst_1',
      source: 'manual', // Explicitly marked as manual, never Cashfree
      amount: numericAmount,
      currency: 'INR',
      status: 'VERIFIED',
      method: paymentMethod,
      utrReference: cleanUtr || null,
      receiptUrl: receiptUrl || null,
      notes: notes || '',
      recordedBy,
      timestamp: paymentTimestamp
    };

    const auditEntry = {
      action: 'MANUAL_PAYMENT_RECORDED',
      changedBy: recordedBy,
      details: `Recorded ₹${numericAmount.toLocaleString()} via ${paymentMethod} (Ref/UTR: ${cleanUtr || 'N/A'}) against "${targetInstallmentName}". Outstanding updated to ₹${newOutstandingBalance.toLocaleString()}.`,
      timestamp: new Date().toISOString()
    };

    const updatePayload = {
      totalPaid: newTotalPaid,
      outstandingBalance: newOutstandingBalance,
      installments,
      paymentsLedger: [...paymentsLedger, newLedgerRecord],
      paymentStatus,
      // If was unpaid or payment pending, move forward
      status: orderData.status === 'Payment Pending' ? 'Payment Confirmed' : orderData.status,
      auditTrail: [...(orderData.auditTrail || []), auditEntry],
      updatedAt: new Date().toISOString()
    };

    await orderDocRef.update(updatePayload);

    return res.status(200).json({
      success: true,
      message: `Manual payment of ₹${numericAmount.toLocaleString()} recorded successfully.`,
      newTotalPaid,
      newOutstandingBalance,
      installments,
      ledgerEntry: newLedgerRecord
    });

  } catch (err) {
    console.error('[Record Manual Payment Error]', err);
    return res.status(500).json({ error: 'Failed to record manual payment.', details: err.message });
  }
}
