import crypto from 'crypto';
import { mailService } from './_services/mailService.js';
import { adminDb, adminAuth } from './_services/firebaseAdmin.js';

const OTP_SALT = process.env.OTP_SALT || 'visualblink_secure_otp_salt_2026';

function hashOtp(otp, uuidIdentifier) {
  return crypto.createHash('sha256').update(`${otp}:${uuidIdentifier}:${OTP_SALT}`).digest('hex');
}

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const action = req.query.action || req.body?.action || (req.body?.otp ? 'verify-otp' : (req.body?.checkEmail ? 'check-email' : ''));

  try {
    // 1. ACTION: CHECK-EMAIL
    if (action === 'check-email') {
      const { email } = req.body || {};
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (!adminDb) {
        return res.status(500).json({ error: 'Firestore Admin not initialized' });
      }

      const snap = await adminDb.collection('users').where('email', '==', normalizedEmail).get();
      if (snap.empty) {
        return res.status(200).json({ exists: false });
      }

      const doc = snap.docs[0].data();
      return res.status(200).json({ exists: true, provider: doc.provider || 'password' });
    }

    // 2. ACTION: VERIFY-OTP
    if (action === 'verify-otp' || req.body?.otp) {
      const { email, otp, challengeId } = req.body || {};
      if (!email || !otp || !challengeId) {
        return res.status(400).json({ error: 'Email address, challenge ID, and verification code are required.' });
      }

      const cleanOtp = String(otp).trim();
      const otpDocRef = adminDb.collection('otps').doc(challengeId);
      const snap = await otpDocRef.get();

      if (!snap.exists) {
        return res.status(400).json({ error: 'No verification code found. Please request a new OTP.' });
      }

      const data = snap.data();
      const now = Date.now();

      if (now > new Date(data.expiresAt).getTime()) {
        await otpDocRef.delete();
        return res.status(400).json({ error: 'Verification code has expired. Please request a new OTP.' });
      }

      if (data.attempts >= 5) {
        await otpDocRef.delete();
        return res.status(429).json({ error: 'Maximum verification attempts exceeded. Please request a new OTP.' });
      }

      await otpDocRef.update({ attempts: (data.attempts || 0) + 1 });

      const calculatedHash = hashOtp(cleanOtp, challengeId);
      if (calculatedHash !== data.otpHash) {
        const remaining = 5 - ((data.attempts || 0) + 1);
        const suffix = remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Please request a new OTP.';
        return res.status(400).json({ error: `Incorrect verification code. ${suffix}` });
      }

      await otpDocRef.delete();

      if (adminAuth) {
        try {
          const uid = data.uid;
          if (uid) {
            let existingClaims = {};
            try {
              const userRecord = await adminAuth.getUser(uid);
              existingClaims = userRecord.customClaims || {};
            } catch (err) {
              console.warn("Could not fetch user record for custom claims:", err.message);
            }

            await adminAuth.setCustomUserClaims(uid, {
              ...existingClaims,
              otpVerifiedAt: Math.floor(Date.now() / 1000)
            });

            return res.status(200).json({
              success: true,
              message: 'OTP verified successfully.',
              verifiedEmail: email
            });
          }
        } catch (adminErr) {
          console.error("Firebase Admin Error:", adminErr);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully (Session updated via fallback).',
        verifiedEmail: email
      });
    }

    // 3. ACTION: SEND-OTP (Default for other POST requests with auth or email)
    const authHeader = req.headers.authorization;
    let decodedToken = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (adminAuth) {
        try {
          decodedToken = await adminAuth.verifyIdToken(token);
        } catch (err) {
          return res.status(401).json({ error: 'Invalid authentication token.' });
        }
      }
    }

    if (!decodedToken) {
      const { email: safeEmail } = req.body || {};
      if (!safeEmail) {
        return res.status(400).json({ error: 'Authentication or email required' });
      }
      decodedToken = { email: safeEmail.toLowerCase(), uid: 'fallback_mode' };
    }

    const email = (req.body.email || decodedToken.email).trim().toLowerCase();
    const uid = req.body.uid || decodedToken.uid;
    const challengeId = req.body.challengeId || email;

    const otpDocRef = adminDb.collection('otps').doc(challengeId);
    const existingSnap = await otpDocRef.get();

    const now = Date.now();
    if (existingSnap.exists) {
      const data = existingSnap.data();
      const resendAvailableAt = new Date(data.resendAvailableAt || 0).getTime();
      if (now < resendAvailableAt) {
        return res.status(429).json({
          error: 'Please wait before requesting another OTP.'
        });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = hashOtp(otp, challengeId);

    const expiresAt = new Date(now + 10 * 60 * 1000).toISOString();
    const resendAvailableAt = new Date(now + 60 * 1000).toISOString();

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
    console.error('[Auth API Error]', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
