import crypto from 'crypto';
import { adminAuth, adminDb } from './_services/firebaseAdmin.js';

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

    // Check expiration
    if (now > new Date(data.expiresAt).getTime()) {
      await otpDocRef.delete();
      return res.status(400).json({ error: 'Verification code has expired. Please request a new OTP.' });
    }

    // Check attempt limit
    if (data.attempts >= 5) {
      await otpDocRef.delete();
      return res.status(429).json({ error: 'Maximum verification attempts exceeded. Please request a new OTP.' });
    }

    // Increment attempts early
    await otpDocRef.update({ attempts: (data.attempts || 0) + 1 });

    // Verify hash match
    const calculatedHash = hashOtp(cleanOtp, challengeId);
    if (calculatedHash !== data.otpHash) {
      const remaining = 5 - ((data.attempts || 0) + 1);
      const suffix = remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Please request a new OTP.';
      return res.status(400).json({ error: `Incorrect verification code. ${suffix}` });
    }

    // OTP verified successfully -> Invalidate immediately (single-use)
    await otpDocRef.delete();

    // Apply Firebase Custom Claim 'otpVerified'
    if (adminAuth) {
      try {
        const uid = data.uid;
        if (uid) {
          // Read existing custom claims to not overwrite `role: admin`
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
        // Fallthrough down
      }
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully (Session updated via fallback).',
      verifiedEmail: email
    });

  } catch (err) {
    console.error('[OTP Verify Error]', err);
    return res.status(500).json({ error: 'Internal server error verifying OTP.', details: err.message });
  }
}
