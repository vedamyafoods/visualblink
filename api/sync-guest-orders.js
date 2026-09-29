import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { uid, email } = req.body || {};

    if (!uid || !email) {
      return res.status(400).json({ error: 'User UID and email are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query unassociated orders matching the user's email
    const ordersRef = collection(db, 'orders');
    const snap = await getDocs(ordersRef);

    let syncedCount = 0;
    const updatePromises = [];

    snap.docs.forEach((orderDoc) => {
      const data = orderDoc.data();
      const orderEmail = (data.customer?.email || data.customerEmail || '').trim().toLowerCase();
      
      const matchesEmail = orderEmail === normalizedEmail;
      const isUnlinked = data.isGuest === true || !data.userId || data.userId === 'guest';

      if (matchesEmail && isUnlinked) {
        syncedCount++;
        const docRef = doc(db, 'orders', orderDoc.id);
        updatePromises.push(
          updateDoc(docRef, {
            userId: uid,
            isGuest: false,
            customerType: 'registered',
            syncedAt: new Date().toISOString()
          })
        );
      }
    });

    await Promise.all(updatePromises);

    return res.status(200).json({
      success: true,
      message: `Successfully synchronized ${syncedCount} guest order(s) to user account.`,
      syncedCount
    });

  } catch (err) {
    console.error('[Guest Order Sync Error]', err);
    return res.status(500).json({ error: 'Failed to synchronize guest orders.', details: err.message });
  }
}
