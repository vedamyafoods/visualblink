import crypto from 'crypto';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

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

const OTP_SALT = process.env.OTP_SALT || 'printigly_secure_otp_salt_2026';

function hashOtp(otp, email) {
  return crypto.createHash('sha256').update(`${otp}:${email}:${OTP_SALT}`).digest('hex');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email address and verification code are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const otpDocRef = doc(db, 'otps', normalizedEmail);
    const snap = await getDoc(otpDocRef);

    if (!snap.exists()) {
      return res.status(400).json({ error: 'No verification code found. Please request a new OTP.' });
    }

    const data = snap.data();
    const now = Date.now();

    // Check expiration
    if (now > new Date(data.expiresAt).getTime()) {
      await deleteDoc(otpDocRef);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new OTP.' });
    }

    // Check attempt limit
    if (data.attempts >= 5) {
      await deleteDoc(otpDocRef);
      return res.status(429).json({ error: 'Maximum verification attempts exceeded. Please request a new OTP.' });
    }

    // Increment attempts
    await updateDoc(otpDocRef, { attempts: (data.attempts || 0) + 1 });

    // Verify hash match
    const calculatedHash = hashOtp(cleanOtp, normalizedEmail);
    if (calculatedHash !== data.otpHash) {
      const remaining = 5 - ((data.attempts || 0) + 1);
      return res.status(400).json({
        error: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Please request a new OTP.'}`
      });
    }

    // OTP verified successfully -> Invalidate immediately (single-use)
    await deleteDoc(otpDocRef);

    // Look up or create user profile in Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', normalizedEmail));
    const userSnap = await getDocs(q);

    let uid;
    let isNewUser = false;
    let userProfile = null;

    if (!userSnap.empty) {
      const existingDoc = userSnap.docs[0];
      uid = existingDoc.data().uid || existingDoc.id;
      userProfile = existingDoc.data();
    } else {
      isNewUser = true;
      uid = `usr_${crypto.randomBytes(8).toString('hex')}`;
      userProfile = {
        uid,
        email: normalizedEmail,
        displayName: normalizedEmail.split('@')[0],
        createdAt: new Date().toISOString(),
        authProvider: 'otp',
        emailVerified: true,
        cart: [],
        wishlist: []
      };
      await setDoc(doc(db, 'users', uid), userProfile);
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      verifiedEmail: normalizedEmail,
      uid,
      isNewUser,
      userProfile
    });

  } catch (err) {
    console.error('[OTP Verify Error]', err);
    return res.status(500).json({ error: 'Internal server error verifying OTP.', details: err.message });
  }
}
