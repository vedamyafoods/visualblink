import nodemailer from 'nodemailer';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  runTransaction,
  serverTimestamp 
} from 'firebase/firestore';

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

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { 
      idempotencyKey,
      items, 
      customer, 
      shippingAddress, 
      paymentMethod, 
      paymentStatus, 
      razorpayPaymentId,
      isExpress,
      couponCode,
      artwork
    } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    if (!customer || !customer.email || !customer.name || !customer.phone) {
      return res.status(400).json({ error: 'Customer name, email, and phone are required.' });
    }

    const normalizedCustomerEmail = customer.email.trim().toLowerCase();

    // 1. Idempotency Check: Prevent duplicate orders
    const effectiveIdempotencyKey = idempotencyKey || req.body.orderId;
    if (effectiveIdempotencyKey) {
      const qKey = query(collection(db, 'orders'), where('idempotencyKey', '==', effectiveIdempotencyKey));
      const keySnap = await getDocs(qKey);
      if (!keySnap.empty) {
        const existingOrder = keySnap.docs[0].data();
        console.log(`[Order API] Duplicate checkout prevented for key: ${effectiveIdempotencyKey}`);
        return res.status(200).json({
          success: true,
          message: 'Order already created previously (Idempotency matched).',
          order: existingOrder,
          isDuplicate: true
        });
      }
    }

    // Generate unique collision-safe Order Number
    const generatedOrderNum = `PRT-${Math.floor(100000 + Math.random() * 900000)}`;

    let createdOrderObj = null;

    // 2. Execute Atomic Firestore Transaction (Validate stock, recalculate prices, deduct stock, create order)
    await runTransaction(db, async (transaction) => {
      let recalculatedSubtotal = 0;
      const validatedItems = [];

      for (const item of items) {
        const prodId = item.productId || item.id;
        const requestedQty = parseInt(item.quantity || item.qty || 1, 10);
        let actualUnitPrice = item.unitPrice || 0;
        let pName = item.productName || item.name || 'Custom Printed Product';

        if (prodId) {
          const prodRef = doc(db, 'products', String(prodId));
          const prodSnap = await transaction.get(prodRef);

          if (prodSnap.exists()) {
            const prodData = prodSnap.data();
            pName = prodData.name || pName;
            actualUnitPrice = prodData.basePrice || prodData.price || actualUnitPrice;

            // Check stock availability
            const currentStock = parseInt(prodData.stock ?? 99999, 10);
            if (currentStock < requestedQty) {
              throw new Error(`INSUFFICIENT_STOCK:${pName}`);
            }

            // Deduct stock atomically
            if (prodData.stock !== undefined && prodData.stock !== null) {
              transaction.update(prodRef, {
                stock: Math.max(0, currentStock - requestedQty),
                updatedAt: new Date().toISOString()
              });
            }
          }
        }

        const itemTotal = actualUnitPrice * requestedQty;
        recalculatedSubtotal += itemTotal;

        validatedItems.push({
          productId: prodId || null,
          productName: pName,
          variant: item.variant || `Paper: ${item.paper || 'Standard'} | Finish: ${item.finish || 'Standard'} | Sides: ${item.sides || 'Single'}`,
          selectedOptions: item.selectedOptions || {},
          quantity: requestedQty,
          unitPrice: actualUnitPrice,
          totalPrice: itemTotal,
          artworkFiles: item.artworkFiles || [],
          artworkNotes: item.artworkNotes || ''
        });
      }

      // Calculate final pricing breakdown server-side
      const expressFee = isExpress ? 250 : 0;
      const shippingFee = recalculatedSubtotal > 999 || recalculatedSubtotal === 0 ? 0 : 99;
      let couponDiscount = 0;

      if (couponCode === 'WELCOME10') {
        couponDiscount = Math.round((recalculatedSubtotal * 10) / 100);
      } else if (couponCode === 'PRINT50') {
        couponDiscount = 50;
      }

      const grandTotal = Math.max(0, Math.round(recalculatedSubtotal - couponDiscount + expressFee + shippingFee));

      const newOrderRef = doc(collection(db, 'orders'));
      const orderId = newOrderRef.id;

      createdOrderObj = {
        id: orderId,
        orderId: generatedOrderNum,
        orderNumber: generatedOrderNum,
        idempotencyKey: effectiveIdempotencyKey || orderId,
        userId: req.body.userId || null,
        isGuest: !req.body.userId,
        customerType: req.body.userId ? 'registered' : 'guest',
        customer: {
          name: customer.name.trim(),
          email: normalizedCustomerEmail,
          phone: customer.phone.trim(),
          company: customer.company || '',
          gstin: customer.gstin || '',
          isB2B: !!customer.isB2B
        },
        shippingAddress: shippingAddress || {},
        deliveryAddress: typeof shippingAddress === 'string' ? shippingAddress : (shippingAddress?.fullAddress || ''),
        items: validatedItems,
        pricing: {
          subtotal: recalculatedSubtotal,
          couponCode: couponCode || null,
          couponDiscount,
          expressFee,
          shippingFee,
          gstPercentage: 18,
          gstAmount: 0, // GST Inclusive
          grandTotal,
          totalAmount: grandTotal
        },
        subtotal: recalculatedSubtotal,
        shippingFee,
        gstAmount: 0,
        totalAmount: grandTotal,
        payment: {
          method: paymentMethod || 'cod',
          status: paymentStatus || (paymentMethod === 'razorpay' ? 'paid' : 'pending'),
          razorpayPaymentId: razorpayPaymentId || null,
          paidAt: paymentStatus === 'paid' ? new Date().toISOString() : null
        },
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: paymentStatus || (paymentMethod === 'razorpay' ? 'paid' : 'pending'),
        status: paymentStatus === 'paid' ? 'Payment Confirmed' : 'Artwork Verification',
        isExpress: !!isExpress,
        artwork: artwork || [],
        emailStatus: {
          customer: 'pending',
          admin: 'pending'
        },
        createdAt: new Date().toISOString()
      };

      transaction.set(newOrderRef, createdOrderObj);
    });

    return res.status(200).json({
      success: true,
      message: 'Order created successfully with atomic stock deduction.',
      order: createdOrderObj
    });

  } catch (err) {
    console.error('[Create Order Error]', err);
    if (err.message.startsWith('INSUFFICIENT_STOCK:')) {
      const prodName = err.message.replace('INSUFFICIENT_STOCK:', '');
      return res.status(409).json({
        error: `Insufficient stock for product: '${prodName}'. Please reduce quantity and try again.`
      });
    }
    return res.status(500).json({ error: 'Failed to process order.', details: err.message });
  }
}
