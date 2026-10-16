import createCashfreeOrderHandler from './_handlers/createCashfreeOrder.js';
import verifyCashfreePaymentHandler from './_handlers/verifyCashfreePayment.js';
import generatePaymentLinkHandler from './_handlers/generatePaymentLink.js';
import recordManualPaymentHandler from './_handlers/recordManualPayment.js';
import manageInstallmentScheduleHandler from './_handlers/manageInstallmentSchedule.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || req.body?.action;

  // 1. Explicit action routing
  if (action === 'create-order' || action === 'create-cashfree-order') {
    return createCashfreeOrderHandler(req, res);
  }
  if (action === 'verify-payment' || action === 'verify-cashfree-payment') {
    return verifyCashfreePaymentHandler(req, res);
  }
  if (action === 'generate-link' || action === 'generate-payment-link') {
    return generatePaymentLinkHandler(req, res);
  }
  if (action === 'record-manual' || action === 'record-manual-payment') {
    return recordManualPaymentHandler(req, res);
  }
  if (action === 'manage-schedule' || action === 'manage-installment-schedule') {
    return manageInstallmentScheduleHandler(req, res);
  }

  // 2. Intelligent payload auto-detection fallback
  if (req.body?.cfOrderId || req.query?.cfOrderId || req.body?.internalOrderId || req.query?.internalOrderId) {
    return verifyCashfreePaymentHandler(req, res);
  }
  if (req.body?.installmentId && (req.body?.customAmount !== undefined || req.body?.expiryDays !== undefined)) {
    return generatePaymentLinkHandler(req, res);
  }
  if (req.body?.paymentMethod && req.body?.amount !== undefined) {
    return recordManualPaymentHandler(req, res);
  }
  if (req.body?.installments && Array.isArray(req.body.installments)) {
    return manageInstallmentScheduleHandler(req, res);
  }
  if (req.body?.items) {
    return createCashfreeOrderHandler(req, res);
  }

  return res.status(400).json({ error: `Unknown payment action: ${action || 'none'}` });
}
