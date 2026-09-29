import nodemailer from 'nodemailer';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

// Initialize Firebase JS SDK for serverless environment
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "AIzaSyBhjJ-PpJRsPwa7jk7FIcbfhWj5rmG4TRM",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || "printing-1620d.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "printing-1620d",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "printing-1620d.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || "805681838557",
  appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "1:805681838557:web:8b222db2ea987cd90f9e34",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

/**
 * Creates Nodemailer Transporter securely from server environment variables
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
}

/**
 * Helper to escape HTML characters
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates Customer Order Confirmation HTML Email
 */
function generateCustomerEmailHtml(order) {
  const orderId = escapeHtml(order.orderId || order.id || 'N/A');
  const customerName = escapeHtml(order.customer?.name || 'Valued Customer');
  const customerEmail = escapeHtml(order.customer?.email || '');
  const customerPhone = escapeHtml(order.customer?.phone || '');
  const deliveryAddress = escapeHtml(order.deliveryAddress || order.shippingAddress?.fullAddress || 'N/A');
  const paymentMethodStr = order.paymentMethod === 'cod' || order.payment?.method === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment (Razorpay)';
  const paymentStatusStr = order.paymentStatus === 'paid' || order.payment?.status === 'paid' ? 'Paid' : 'Pending';
  const isExpress = order.isExpress;

  const items = Array.isArray(order.items) ? order.items : [];
  const pricing = order.pricing || {};
  const subtotal = pricing.subtotal || order.subtotal || 0;
  const discount = pricing.couponDiscount || order.couponDiscount || 0;
  const expressFee = pricing.expressFee || 0;
  const shippingFee = pricing.shippingFee ?? order.shippingFee ?? 0;
  const grandTotal = pricing.grandTotal || pricing.totalAmount || order.totalAmount || 0;

  const itemsHtml = items.map((item, idx) => {
    const pName = escapeHtml(item.productName || item.name || `Item ${idx + 1}`);
    const qty = item.quantity || item.qty || 1;
    const unitPrice = item.unitPrice || 0;
    const totalPrice = item.totalPrice || (unitPrice * qty);
    const variant = escapeHtml(item.variant || '');
    
    let filesListHtml = '';
    if (item.artworkFiles && Array.isArray(item.artworkFiles) && item.artworkFiles.length > 0) {
      filesListHtml = item.artworkFiles.map(f => `
        <div style="font-size:11px; color:#475569; margin-top:3px;">
          📁 Artwork: <strong>${escapeHtml(f.originalName || f.fileName || 'Uploaded File')}</strong>
        </div>
      `).join('');
    }

    return `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b; vertical-align: top;">
          <strong style="color: #0f172a;">${pName}</strong>
          ${variant ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${variant}</div>` : ''}
          ${filesListHtml}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b; text-align: center; vertical-align: top;">
          ${qty}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; color: #0f172a; text-align: right; vertical-align: top;">
          ₹${totalPrice.toLocaleString()}
        </td>
      </tr>
    `;
  }).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmed - #${orderId}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 20px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            
            <!-- HEADER -->
            <tr>
              <td style="background-color: #07152F; padding: 32px 24px; text-align: center; color: #ffffff;">
                <div style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; margin-bottom: 4px;">
                  PRINTIGLY<span style="color: #FF5A1F;">PRESS</span>
                </div>
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 20px;">
                  Enterprise Print & Packaging
                </div>
                <div style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                  Order Confirmed 🎉
                </div>
              </td>
            </tr>

            <!-- CONTENT BODY -->
            <tr>
              <td style="padding: 32px 24px;">
                <p style="font-size: 15px; color: #334155; margin-top: 0; line-height: 1.6;">
                  Dear <strong>${customerName}</strong>,
                </p>
                <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
                  Thank you for placing your order with Printigly Press! Your print order <strong style="color: #0f172a;">#${orderId}</strong> has been received and sent directly into our live production pipeline.
                </p>

                <!-- ORDER INFO BOX -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                  <tr>
                    <td style="font-size: 12px; color: #64748b; line-height: 1.8;">
                      <strong style="color: #0f172a;">Order Reference:</strong> #${orderId}<br>
                      <strong style="color: #0f172a;">Order Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}<br>
                      <strong style="color: #0f172a;">Payment Method:</strong> ${paymentMethodStr} (${paymentStatusStr})<br>
                      <strong style="color: #0f172a;">Delivery Mode:</strong> ${isExpress ? 'Express 24h Turnaround' : 'Standard Delivery'}
                    </td>
                  </tr>
                </table>

                <!-- ITEMS TABLE -->
                <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Order Specifications
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                  <thead>
                    <tr style="background-color: #f8fafc;">
                      <th style="padding: 10px 16px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; border-bottom: 1px solid #e2e8f0;">Item</th>
                      <th style="padding: 10px 16px; text-align: center; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; border-bottom: 1px solid #e2e8f0;">Qty</th>
                      <th style="padding: 10px 16px; text-align: right; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; border-bottom: 1px solid #e2e8f0;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>

                <!-- PRICE SUMMARY -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                  <tr>
                    <td width="50%"></td>
                    <td width="50%">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #475569;">
                        <tr>
                          <td style="padding: 4px 0;">Subtotal:</td>
                          <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #0f172a;">₹${subtotal.toLocaleString()}</td>
                        </tr>
                        ${discount > 0 ? `
                        <tr>
                          <td style="padding: 4px 0; color: #10b981;">Discount:</td>
                          <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #10b981;">-₹${discount.toLocaleString()}</td>
                        </tr>` : ''}
                        ${expressFee > 0 ? `
                        <tr>
                          <td style="padding: 4px 0;">Express Fee:</td>
                          <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #0f172a;">+₹${expressFee.toLocaleString()}</td>
                        </tr>` : ''}
                        <tr>
                          <td style="padding: 4px 0;">Shipping Fee:</td>
                          <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #0f172a;">${shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0;">GST Tax:</td>
                          <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #10b981;">Inclusive</td>
                        </tr>
                        <tr style="border-top: 2px solid #e2e8f0;">
                          <td style="padding: 10px 0 4px 0; font-size: 15px; font-weight: 900; color: #0f172a;">Total Amount:</td>
                          <td style="padding: 10px 0 4px 0; text-align: right; font-size: 18px; font-weight: 900; color: #FF5A1F;">₹${grandTotal.toLocaleString()}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- SHIPPING DESTINATION -->
                <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                  <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #1d4ed8; margin-bottom: 4px;">
                    Shipping Address
                  </div>
                  <div style="font-size: 13px; color: #1e3a8a; font-weight: 600; line-height: 1.5;">
                    <strong>${customerName}</strong> (${customerPhone})<br>
                    ${deliveryAddress}
                  </div>
                </div>

                <!-- NEXT STEPS -->
                <div style="font-size: 13px; color: #475569; line-height: 1.6; background-color: #f8fafc; border-radius: 12px; padding: 16px;">
                  <strong style="color: #0f172a; display: block; margin-bottom: 6px;">Next Steps:</strong>
                  1. Pre-flight proofing check of your uploaded artwork files.<br>
                  2. High-precision printing & finishing in our state-of-the-art facility.<br>
                  3. Quality audit & courier dispatch with live tracking updates.
                </div>

              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                <p style="margin: 0 0 8px 0;">Need help with your order? Reach out to our print support team at <a href="mailto:support@printigly.com" style="color: #FF5A1F; text-decoration: none; font-weight: bold;">support@printigly.com</a>.</p>
                <p style="margin: 0; color: #94a3b8; font-size: 11px;">© ${new Date().getFullYear()} Printigly Press. All rights reserved.</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * Generates Internal Admin Order Notification HTML Email
 */
function generateAdminEmailHtml(order) {
  const orderId = escapeHtml(order.orderId || order.id || 'N/A');
  const docId = escapeHtml(order.id || '');
  const customerName = escapeHtml(order.customer?.name || 'Guest User');
  const customerEmail = escapeHtml(order.customer?.email || 'N/A');
  const customerPhone = escapeHtml(order.customer?.phone || 'N/A');
  const customerType = escapeHtml(order.customerType || (order.userId ? 'Registered User' : 'Guest'));
  const userId = escapeHtml(order.userId || 'Guest');
  const isB2B = order.customer?.isB2B;
  const company = escapeHtml(order.customer?.company || '');
  const gstin = escapeHtml(order.customer?.gstin || '');

  const deliveryAddress = escapeHtml(order.deliveryAddress || order.shippingAddress?.fullAddress || 'N/A');
  const paymentMethod = escapeHtml(order.paymentMethod || order.payment?.method || 'N/A');
  const paymentStatus = escapeHtml(order.paymentStatus || order.payment?.status || 'N/A');
  const razorpayPaymentId = escapeHtml(order.payment?.razorpayPaymentId || 'N/A');
  const grandTotal = (order.pricing?.grandTotal || order.totalAmount || 0).toLocaleString();

  const items = Array.isArray(order.items) ? order.items : [];
  const artwork = Array.isArray(order.artwork) ? order.artwork : [];

  const itemsHtml = items.map((item, idx) => {
    const pName = escapeHtml(item.productName || item.name || `Item ${idx + 1}`);
    const qty = item.quantity || item.qty || 1;
    const variant = escapeHtml(item.variant || '');
    
    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-size: 12px; font-weight: bold; color: #0f172a;">${pName}</td>
        <td style="padding: 10px 12px; font-size: 11px; color: #475569;">${variant}</td>
        <td style="padding: 10px 12px; font-size: 12px; font-weight: bold; text-align: center; color: #0f172a;">${qty}</td>
        <td style="padding: 10px 12px; font-size: 12px; font-weight: bold; text-align: right; color: #0f172a;">₹${(item.totalPrice || 0).toLocaleString()}</td>
      </tr>
    `;
  }).join('');

  let artworkHtml = '';
  if (artwork.length > 0) {
    artworkHtml = artwork.map((art, idx) => {
      const fileName = escapeHtml(art.fileName || art.originalName || `Artwork ${idx + 1}`);
      const secureUrl = art.secureUrl || art.url || '';
      
      return `
        <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
          <div style="font-size: 12px; font-weight: bold; color: #0f172a; margin-bottom: 4px;">
            📄 File #${idx + 1}: ${fileName}
          </div>
          ${secureUrl ? `
            <div style="margin-top: 6px;">
              <a href="${secureUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 6px 14px; border-radius: 6px; font-size: 11px; font-weight: bold; text-decoration: none;">
                📥 View / Download High-Res Artwork
              </a>
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px; word-break: break-all;">
              URL: ${escapeHtml(secureUrl)}
            </div>
          ` : '<div style="font-size: 11px; color: #94a3b8;">No direct Cloudinary URL attached.</div>'}
        </div>
      `;
    }).join('');
  } else {
    artworkHtml = '<div style="font-size: 12px; color: #64748b;">No uploaded artwork files attached to this order.</div>';
  }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>[NEW ORDER ALERT] #${orderId}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 20px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 650px; background-color: #ffffff; border-radius: 16px; border: 2px solid #e2e8f0; overflow: hidden;">
            
            <!-- HEADER BANNER -->
            <tr>
              <td style="background-color: #07152F; padding: 24px; color: #ffffff;">
                <div style="font-size: 11px; font-weight: 900; uppercase; color: #f97316; letter-spacing: 1.5px; margin-bottom: 4px;">
                  ⚠️ INTERNAL ADMIN ORDER NOTIFICATION
                </div>
                <div style="font-size: 22px; font-weight: 900; color: #ffffff;">
                  New Order Placed: #${orderId}
                </div>
                <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">
                  Total Amount: <strong style="color: #38bdf8;">₹${grandTotal}</strong> | Payment: <strong style="color: #4ade80;">${paymentStatus.toUpperCase()} (${paymentMethod.toUpperCase()})</strong>
                </div>
              </td>
            </tr>

            <!-- ORDER METADATA -->
            <tr>
              <td style="padding: 24px;">
                
                <!-- CUSTOMER CARD -->
                <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                  <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">
                    Customer Details (${customerType})
                  </div>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px; color: #1e293b; line-height: 1.8;">
                    <tr>
                      <td width="30%"><strong>Name:</strong></td>
                      <td>${customerName}</td>
                    </tr>
                    <tr>
                      <td><strong>Email:</strong></td>
                      <td><a href="mailto:${customerEmail}" style="color: #2563eb; text-decoration: none;">${customerEmail}</a></td>
                    </tr>
                    <tr>
                      <td><strong>Phone:</strong></td>
                      <td>${customerPhone}</td>
                    </tr>
                    <tr>
                      <td><strong>User ID:</strong></td>
                      <td><code>${userId}</code></td>
                    </tr>
                    ${isB2B ? `
                    <tr>
                      <td><strong>Company:</strong></td>
                      <td>${company}</td>
                    </tr>
                    <tr>
                      <td><strong>GSTIN:</strong></td>
                      <td><code>${gstin}</code></td>
                    </tr>
                    ` : ''}
                  </table>
                </div>

                <!-- DELIVERY ADDRESS -->
                <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                  <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 6px;">
                    Shipping Address
                  </div>
                  <div style="font-size: 12px; color: #0f172a; line-height: 1.5;">
                    ${deliveryAddress}
                  </div>
                </div>

                <!-- UPLOADED ARTWORK FILES -->
                <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                  <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #1d4ed8; margin-bottom: 10px;">
                    🖼️ Uploaded Printing Artwork Files
                  </div>
                  ${artworkHtml}
                </div>

                <!-- ITEMS TABLE -->
                <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 8px;">
                  Order Items Specification
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                  <thead>
                    <tr style="background-color: #f8fafc; font-size: 11px; color: #64748b; text-transform: uppercase;">
                      <th style="padding: 8px 12px; text-align: left;">Product</th>
                      <th style="padding: 8px 12px; text-align: left;">Specifications</th>
                      <th style="padding: 8px 12px; text-align: center;">Qty</th>
                      <th style="padding: 8px 12px; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>

                <!-- PAYMENT & AUDIT INFO -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-size: 11px; color: #64748b; line-height: 1.8;">
                  <strong>Payment Audit:</strong><br>
                  Payment Method: <strong>${paymentMethod}</strong><br>
                  Payment Status: <strong>${paymentStatus}</strong><br>
                  Razorpay Payment ID: <code>${razorpayPaymentId}</code><br>
                  Firestore Document ID: <code>${docId}</code>
                </div>

              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background-color: #07152F; padding: 16px; text-align: center; color: #94a3b8; font-size: 11px;">
                Printigly Press Automated Order Dispatch System
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * Main Vercel API Route Handler
 */
export default async function handler(req, res) {
  // CORS Headers for API calls
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { orderId, docId, forceRetry } = req.body || {};

    if (!orderId && !docId) {
      return res.status(400).json({ error: 'Missing orderId or docId parameter.' });
    }

    // 1. Fetch Authoritative Order Data from Firestore
    let orderDoc = null;
    let orderDocRef = null;

    if (docId) {
      const snap = await getDoc(doc(db, 'orders', docId));
      if (snap.exists()) {
        orderDoc = { id: snap.id, ...snap.data() };
        orderDocRef = doc(db, 'orders', snap.id);
      }
    }

    if (!orderDoc && orderId) {
      const q = query(collection(db, 'orders'), where('orderId', '==', orderId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const firstDoc = snap.docs[0];
        orderDoc = { id: firstDoc.id, ...firstDoc.data() };
        orderDocRef = doc(db, 'orders', firstDoc.id);
      }
    }

    if (!orderDoc) {
      return res.status(404).json({ error: `Order with identifier '${orderId || docId}' was not found in database.` });
    }

    // 2. Prevent Duplicate Emails (Idempotency Check)
    const existingStatus = orderDoc.emailStatus || {};
    if (!forceRetry && existingStatus.customer === 'sent' && existingStatus.admin === 'sent') {
      return res.status(200).json({
        success: true,
        message: 'Order confirmation and admin emails were already sent previously.',
        emailStatus: existingStatus
      });
    }

    // 3. Extract & Normalize Customer Checkout Email
    const rawCustomerEmail = orderDoc.customer?.email || orderDoc.customerEmail || '';
    const customerEmail = rawCustomerEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validCustomerEmail = emailRegex.test(customerEmail) ? customerEmail : null;

    const adminEmail = (process.env.ADMIN_EMAIL || process.env.SMTP_USER || '').trim().toLowerCase();

    // 4. Initialize Nodemailer SMTP Transporter
    const transporter = getTransporter();
    if (!transporter) {
      console.warn(`[SMTP Warning] SMTP server not configured for order #${orderDoc.orderId || orderDoc.id}`);
      const unconfiguredStatus = {
        customer: existingStatus.customer === 'sent' ? 'sent' : 'failed',
        admin: existingStatus.admin === 'sent' ? 'sent' : 'failed',
        lastAttemptedAt: new Date().toISOString(),
        customerError: !validCustomerEmail ? 'Invalid customer email' : 'SMTP credentials missing on server',
        adminError: !adminEmail ? 'ADMIN_EMAIL missing on server' : 'SMTP credentials missing on server'
      };

      if (orderDocRef) {
        await updateDoc(orderDocRef, { emailStatus: unconfiguredStatus });
      }

      return res.status(200).json({
        success: false,
        message: 'Order saved in Firestore, but SMTP server is not configured.',
        emailStatus: unconfiguredStatus
      });
    }

    const smtpFrom = process.env.SMTP_FROM || `Printigly Press <${process.env.SMTP_USER}>`;

    let customerResult = { success: existingStatus.customer === 'sent' };
    let adminResult = { success: existingStatus.admin === 'sent' };

    // 5. Send Customer Order Confirmation Email
    if (validCustomerEmail && (existingStatus.customer !== 'sent' || forceRetry)) {
      try {
        const customerHtml = generateCustomerEmailHtml(orderDoc);
        const info = await transporter.sendMail({
          from: smtpFrom,
          to: validCustomerEmail,
          subject: `Order Confirmed - #${orderDoc.orderId || orderDoc.id} | Printigly Press`,
          html: customerHtml
        });
        console.log(`[Email Success] Customer email sent to ${validCustomerEmail}. MessageId: ${info.messageId}`);
        customerResult = { success: true, messageId: info.messageId };
      } catch (err) {
        console.error(`[Email Error] Customer email failed for ${validCustomerEmail}:`, err.message);
        customerResult = { success: false, error: err.message };
      }
    } else if (!validCustomerEmail) {
      customerResult = { success: false, error: 'Invalid customer email address' };
    }

    // 6. Send Admin Notification Email
    if (adminEmail && (existingStatus.admin !== 'sent' || forceRetry)) {
      try {
        const adminHtml = generateAdminEmailHtml(orderDoc);
        const info = await transporter.sendMail({
          from: smtpFrom,
          to: adminEmail,
          subject: `[NEW ORDER] #${orderDoc.orderId || orderDoc.id} - ${orderDoc.customer?.name || 'Customer'} (₹${(orderDoc.pricing?.grandTotal || orderDoc.totalAmount || 0).toLocaleString()})`,
          html: adminHtml
        });
        console.log(`[Email Success] Admin notification sent to ${adminEmail}. MessageId: ${info.messageId}`);
        adminResult = { success: true, messageId: info.messageId };
      } catch (err) {
        console.error(`[Email Error] Admin email failed for ${adminEmail}:`, err.message);
        adminResult = { success: false, error: err.message };
      }
    } else if (!adminEmail) {
      adminResult = { success: false, error: 'ADMIN_EMAIL environment variable not set' };
    }

    // 7. Update Email Status in Firestore
    const updatedEmailStatus = {
      customer: customerResult.success ? 'sent' : 'failed',
      admin: adminResult.success ? 'sent' : 'failed',
      lastAttemptedAt: new Date().toISOString(),
      customerError: customerResult.error || null,
      adminError: adminResult.error || null
    };

    if (orderDocRef) {
      await updateDoc(orderDocRef, { emailStatus: updatedEmailStatus });
    }

    return res.status(200).json({
      success: customerResult.success || adminResult.success,
      message: customerResult.success && adminResult.success
        ? 'Customer and Admin emails sent successfully.'
        : 'Email sending process completed.',
      emailStatus: updatedEmailStatus
    });

  } catch (error) {
    console.error('[API Error] Order email handler error:', error);
    return res.status(500).json({
      error: 'Internal server error while sending order emails.',
      details: error.message
    });
  }
}
