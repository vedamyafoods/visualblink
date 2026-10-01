import crypto from 'crypto';
import { mailService } from './_services/mailService.js';
import { adminDb, adminAuth } from './_services/firebaseAdmin.js';

const OTP_SALT = process.env.OTP_SALT || 'printigly_secure_otp_salt_2026';

function hashOtp(otp, uuidIdentifier) {
  return crypto.createHash('sha256').update(`${otp}:${uuidIdentifier}:${OTP_SALT}`).digest('hex');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    // We expect the client to send a valid Firebase ID Token and its UID for security
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header.' });
    }

    const token = authHeader.split(' ')[1];
    let decodedToken = null;

    if (adminAuth) {
      try {
        decodedToken = await adminAuth.verifyIdToken(token);
      } catch (err) {
        return res.status(401).json({ error: 'Invalid authentication token.' });
      }
    } else {
      // In a completely stateless dev setup without Admin SDK, we might just trust the email from body
      // But we PREFER full security. 
      console.warn("send-otp: Admin Auth not initialized. Ensure FIREBASE_ADMIN_* vars are set.");
      // DO NOT fallback securely without token if we want strict security.
      // But we fallback to checking body email if admin is missing (for local testing mostly)
      const { email: safeEmail } = req.body || {};
      if (!safeEmail) return res.status(400).json({ error: 'Authentication required' });
      decodedToken = { email: safeEmail.toLowerCase(), uid: 'fallback_mode' };
    }

    const email = (req.body.email || decodedToken.email).trim().toLowerCase();
    const uid = req.body.uid || decodedToken.uid;
    const challengeId = req.body.challengeId || email; // Can be a session ID or just bound to email

    // Check rate limit / resend cooldown in Firestore using adminDb
    const otpDocRef = adminDb.collection('otps').doc(challengeId);
    const existingSnap = await otpDocRef.get();

    const now = Date.now();
    if (existingSnap.exists) {
      const data = existingSnap.data();
      const resendAvailableAt = new Date(data.resendAvailableAt || 0).getTime();
      if (now < resendAvailableAt) {
        return res.status(429).json({
          error: `Please wait before requesting another OTP.`
        });
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = hashOtp(otp, challengeId);

    const expiresAt = new Date(now + 10 * 60 * 1000).toISOString();
    const resendAvailableAt = new Date(now + 60 * 1000).toISOString(); // 60 seconds cooldown

    // Store hashed OTP in Firestore
    await otpDocRef.set({
      challengeId,
      uid,
      email,
      otpHash: hashedOtp,
      attempts: 0,
      createdAt: new Date(now).toISOString(),
      expiresAt,
      resendAvailableAt,
      purpose: 'login'
    });

    try {
      await mailService.sendAuthOTP(email, otp);
    } catch (mailErr) {
      console.error("[Mail Error]", mailErr);
      return res.status(500).json({ error: 'Could not send email. SMTP misconfigured.' });
    }

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${email}.`,
      expiresInMinutes: 10,
      challengeId
    });

  } catch (err) {
    console.error('[OTP Send Error]', err);
    return res.status(500).json({ error: 'Failed to send verification OTP.', details: err.message });
  }
}
