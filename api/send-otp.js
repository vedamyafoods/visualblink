import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Initialize Firebase SDK for serverless environment
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

function generateOtpHtml(otp) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f1f5f9; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            
            <!-- HEADER -->
            <tr>
              <td style="background-color: #07152F; padding: 28px 24px; text-align: center; color: #ffffff;">
                <div style="font-size: 22px; font-weight: 900; color: #ffffff; margin-bottom: 4px;">
                  PRINTIGLY<span style="color: #FF5A1F;">PRESS</span>
                </div>
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8;">
                  Security Verification
                </div>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding: 32px 24px; text-align: center;">
                <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
                  Your Verification Code
                </h2>
                <p style="font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
                  Use the 6-digit code below to sign in or complete your account verification. This code is valid for <strong>10 minutes</strong>.
                </p>

                <!-- OTP BOX -->
                <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                  <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #FF5A1F; font-family: monospace;">
                    ${otp}
                  </span>
                </div>

                <p style="font-size: 11px; color: #64748b; margin-bottom: 0; line-height: 1.5;">
                  ⚠️ For security reasons, do not share this code with anyone. Our team will never ask for your verification code.
                </p>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
                © ${new Date().getFullYear()} Printigly Press. All rights reserved.
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email address format.' });
    }

    // Check rate limit / resend cooldown in Firestore
    const otpDocRef = doc(db, 'otps', normalizedEmail);
    const existingSnap = await getDoc(otpDocRef);

    const now = Date.now();
    if (existingSnap.exists()) {
      const data = existingSnap.data();
      const resendAvailableAt = new Date(data.resendAvailableAt || 0).getTime();
      if (now < resendAvailableAt) {
        const waitSeconds = Math.ceil((resendAvailableAt - now) / 1000);
        return res.status(429).json({
          error: `Please wait ${waitSeconds} seconds before requesting a new OTP.`
        });
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = hashOtp(otp, normalizedEmail);

    const expiresAt = new Date(now + 10 * 60 * 1000).toISOString();
    const resendAvailableAt = new Date(now + 30 * 1000).toISOString();

    // Store hashed OTP in Firestore
    await setDoc(otpDocRef, {
      email: normalizedEmail,
      otpHash: hashedOtp,
      attempts: 0,
      createdAt: new Date(now).toISOString(),
      expiresAt,
      resendAvailableAt
    });

    // Dispatch Nodemailer Email
    const transporter = getTransporter();
    if (transporter) {
      const smtpFrom = process.env.SMTP_FROM || `Printigly Press <${process.env.SMTP_USER}>`;
      await transporter.sendMail({
        from: smtpFrom,
        to: normalizedEmail,
        subject: `Verification Code: ${otp} | Printigly Press`,
        html: generateOtpHtml(otp)
      });
      console.log(`[OTP] Sent verification code to ${normalizedEmail}`);
    } else {
      console.warn(`[OTP Warning] SMTP credentials missing. In development mode, raw OTP is: ${otp}`);
    }

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}.`,
      expiresInMinutes: 10
    });

  } catch (err) {
    console.error('[OTP Send Error]', err);
    return res.status(500).json({ error: 'Failed to send verification OTP.', details: err.message });
  }
}
