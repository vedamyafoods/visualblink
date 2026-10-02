import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import crypto from 'crypto';

// Initialize Firebase SDK for serverless environment
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const HASH_SALT = process.env.IP_HASH_SALT || 'printigly_security_salt';

function hashIp(ip) {
    return crypto.createHash('sha256').update(`${ip}:${HASH_SALT}`).digest('hex');
}

/**
 * Firebase Identity Platform Blocking Function (beforeSignIn)
 * 
 * IMPORTANT: To use this natively, you must:
 * 1. Upgrade Firebase Project to with Identity Platform.
 * 2. In Firebase Console -> Authentication -> Settings -> Blocking functions.
 * 3. Register this endpoint URL as the 'beforeSignIn' webhook.
 * 4. This webhook securely processes IP rate limits on the server before Firebase issues tokens.
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    try {
        const event = req.body;
        // Extract IP from Blocking Function event payload or Vercel Headers
        const rawIp = event?.ipAddress || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const clientIp = rawIp.split(',')[0].trim();
        const email = event?.user?.email || 'unknown';

        const hashedIp = hashIp(clientIp);
        const limitDocRef = doc(db, 'authSecurity', hashedIp);
        const snap = await getDoc(limitDocRef);

        const now = Date.now();
        let failedAttempts = 0;
        let blockedUntil = 0;

        if (snap.exists()) {
            const data = snap.data();
            failedAttempts = data.failedAttempts || 0;
            blockedUntil = new Date(data.blockedUntil || 0).getTime();

            if (now < blockedUntil) {
                // IP is currently blocked
                console.warn(`[AUTH BLOCKED] IP: ${hashedIp} is blocked until ${new Date(blockedUntil).toISOString()}`);

                // Log Activity
                const logRef = doc(collection(db, 'adminLogs'));
                await setDoc(logRef, {
                    type: "login_blocked",
                    timestamp: new Date().toISOString(),
                    ipHash: hashedIp,
                    userEmailHash: hashIp(email),
                    reason: "Too many failed attempts. Rate limit enforced.",
                    blocked: true
                });

                // Identity Platform rejection payload
                return res.status(403).json({
                    error: {
                        message: "Too many unsuccessful login attempts. Please try again later."
                    }
                });
            }
        }

        // Since this is beforeSignIn, we don't definitively know if the password is wrong yet,
        // unless this webhook is fired BEFORE password check. 
        // Identity platform fires beforeSignIn *after* credentials are verified but before tokens are issued.
        // Wait, if credentials are correct, failedAttempts should be reset!

        // Reset attempts on successful sign-in
        await setDoc(limitDocRef, {
            failedAttempts: 0,
            blockedUntil: 0,
            updatedAt: new Date(now).toISOString()
        }, { merge: true });

        // Allow sign in
        return res.status(200).json({});
    } catch (error) {
        console.error('[Blocking Function Error]', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
