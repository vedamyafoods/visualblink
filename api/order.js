import calculateOrderSummaryHandler from './_handlers/calculateOrderSummary.js';
import createOrderHandler from './_handlers/createOrder.js';
import updateOrderAdminHandler from './_handlers/updateOrderAdmin.js';
import syncGuestOrdersHandler from './_handlers/syncGuestOrders.js';

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
  if (action === 'calculate-summary' || action === 'calculate-order-summary') {
    return calculateOrderSummaryHandler(req, res);
  }
  if (action === 'create' || action === 'create-order') {
    return createOrderHandler(req, res);
  }
  if (action === 'update-admin' || action === 'update-order-admin') {
    return updateOrderAdminHandler(req, res);
  }
  if (action === 'sync-guest' || action === 'sync-guest-orders') {
    return syncGuestOrdersHandler(req, res);
  }

  // 2. Intelligent payload auto-detection fallback
  if (req.body?.newStatus && req.body?.orderId) {
    return updateOrderAdminHandler(req, res);
  }
  if (req.body?.uid && req.body?.email && !req.body?.items) {
    return syncGuestOrdersHandler(req, res);
  }
  if (req.body?.items && req.body?.customer?.phone) {
    return createOrderHandler(req, res);
  }
  if (req.body?.items) {
    return calculateOrderSummaryHandler(req, res);
  }

  return res.status(400).json({ error: `Unknown order action: ${action || 'none'}` });
}
