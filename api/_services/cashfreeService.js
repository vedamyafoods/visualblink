import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function ensureCashfreeEnv() {
  if (process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET) {
    return;
  }
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.slice(0, idx).trim();
          let val = trimmed.slice(idx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (key.startsWith('CASHFREE_') || !process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    }
  } catch (e) {
    console.warn('[Cashfree Env Loader Warning]', e.message);
  }
}

function getCashfreeBaseUrl() {
  ensureCashfreeEnv();
  const secret = process.env.CASHFREE_CLIENT_SECRET || '';
  const isProd = secret.startsWith('cfsk_ma_prod_') || process.env.CASHFREE_ENVIRONMENT === 'production';
  return isProd ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
}

function getCashfreeApiVersion() {
  return process.env.CASHFREE_API_VERSION || '2023-08-01';
}

/**
 * Returns standard Cashfree API headers
 */
function getCashfreeHeaders() {
  ensureCashfreeEnv();
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Cashfree credentials missing: CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET must be configured in environment variables.');
  }

  return {
    'Content-Type': 'application/json',
    'x-client-id': clientId,
    'x-client-secret': clientSecret,
    'x-api-version': getCashfreeApiVersion()
  };
}

/**
 * Creates an order in Cashfree Payment Gateway
 */
export async function createCashfreeOrder({
  orderId,
  orderAmount,
  currency = 'INR',
  customer,
  returnUrl,
  notifyUrl,
  orderNote = ''
}) {
  const cleanPhone = (customer?.phone || '').replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length !== 10) {
    throw new Error('A valid 10-digit Indian phone number is required for Cashfree checkout.');
  }

  // Validate customer email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const rawEmail = (customer?.email || '').trim().toLowerCase();
  const cleanEmail = emailRegex.test(rawEmail) ? rawEmail : 'customer@visualblink.com';

  // Sanitize customer name (alphanumeric, spaces, min 2 chars)
  let cleanName = (customer?.name || '').trim().replace(/[^\w\s.-]/g, '');
  if (!cleanName || cleanName.length < 2) {
    cleanName = 'Valued Customer';
  }

  // Ensure minimum amount
  const sanitizedAmount = Math.max(1, Math.round(Number(orderAmount) * 100) / 100);

  // Cashfree Production requires https return_url
  let effectiveReturnUrl = returnUrl;
  if (!effectiveReturnUrl || effectiveReturnUrl.startsWith('http://localhost') || effectiveReturnUrl.startsWith('http://127.0.0.1')) {
    effectiveReturnUrl = 'https://visualblink.com/payment-callback?order_id={order_id}';
  }

  const payload = {
    order_id: String(orderId),
    order_amount: sanitizedAmount,
    order_currency: currency,
    customer_details: {
      customer_id: String(customer?.id || customer?.customerId || `cust_${cleanPhone}`),
      customer_name: cleanName.slice(0, 50),
      customer_email: cleanEmail,
      customer_phone: cleanPhone
    },
    order_meta: {
      return_url: effectiveReturnUrl,
      ...(notifyUrl ? { notify_url: notifyUrl } : {})
    },
    ...(orderNote ? { order_note: orderNote.slice(0, 200) } : {})
  };

  const response = await fetch(`${getCashfreeBaseUrl()}/orders`, {
    method: 'POST',
    headers: getCashfreeHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[Cashfree API Error Create Order]', data);
    const detailMsg = data.message || data.error || (data.sub_code ? `${data.sub_code}: ${data.message}` : JSON.stringify(data));
    throw new Error(`Cashfree error (${response.status}): ${detailMsg}`);
  }

  return {
    orderId: data.order_id,
    paymentSessionId: data.payment_session_id,
    orderStatus: data.order_status,
    entity: data.entity
  };
}

/**
 * Fetches verified payment attempts directly from Cashfree for an order
 */
export async function getCashfreeOrderPayments(orderId) {
  const response = await fetch(`${getCashfreeBaseUrl()}/orders/${encodeURIComponent(orderId)}/payments`, {
    method: 'GET',
    headers: getCashfreeHeaders()
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`[Cashfree API Error Get Order Payments ${orderId}]`, data);
    throw new Error(data.message || 'Failed to fetch order payments from Cashfree.');
  }

  return Array.isArray(data) ? data : [];
}

/**
 * Creates a unique Cashfree Payment Link for an installment
 */
export async function createCashfreePaymentLink({
  linkId,
  linkAmount,
  linkCurrency = 'INR',
  linkPurpose,
  customer,
  returnUrl,
  notifyUrl,
  expiryMinutes = 4320 // Default 3 days
}) {
  const cleanPhone = (customer.phone || '').replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length !== 10) {
    throw new Error('Valid 10-digit customer phone number required for payment link.');
  }

  // Calculate expiry in ISO 8601 format
  const expiryDate = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();

    let effectiveReturnUrl = returnUrl;
    if (!effectiveReturnUrl || effectiveReturnUrl.startsWith('http://localhost') || effectiveReturnUrl.startsWith('http://127.0.0.1')) {
      effectiveReturnUrl = 'https://visualblink.com/payment-callback?link_id={link_id}';
    }

    const payload = {
      link_id: String(linkId),
      link_amount: Math.round(Number(linkAmount) * 100) / 100,
      link_currency: linkCurrency,
      link_purpose: linkPurpose || 'Installment Payment',
      customer_details: {
        customer_phone: cleanPhone,
        customer_email: customer.email || 'customer@example.com',
        customer_name: customer.name || 'Valued Customer'
      },
      link_meta: {
        return_url: effectiveReturnUrl,
        ...(notifyUrl ? { notify_url: notifyUrl } : {})
      },
    link_expiry_time: expiryDate,
    link_auto_reminders: true,
    link_notify: {
      send_sms: true,
      send_email: true
    }
  };

  const response = await fetch(`${getCashfreeBaseUrl()}/links`, {
    method: 'POST',
    headers: getCashfreeHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[Cashfree API Error Create Link]', data);
    throw new Error(data.message || data.error || 'Failed to create Cashfree payment link.');
  }

  return {
    linkId: data.link_id,
    linkUrl: data.link_url,
    linkStatus: data.link_status,
    linkAmount: data.link_amount,
    linkExpiryTime: data.link_expiry_time
  };
}

/**
 * Verifies Cashfree Webhook Signature using HMAC-SHA256 and raw request body
 */
export function verifyCashfreeWebhookSignature({
  signature,
  timestamp,
  rawBody,
  secret = process.env.CASHFREE_CLIENT_SECRET
}) {
  if (!signature || !timestamp || !secret || !rawBody) {
    return false;
  }

  try {
    const payloadToSign = timestamp + rawBody;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadToSign)
      .digest('base64');

    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expectedSignature, 'utf8');

    if (sigBuf.length !== expBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch (err) {
    console.warn('[Cashfree Webhook Signature Check Failed]', err.message);
    return false;
  }
}
