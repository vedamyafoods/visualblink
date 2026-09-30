import crypto from 'crypto';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const HASH_SALT = process.env.IP_HASH_SALT || 'printigly_security_salt';
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

function hashString(str) {
    return crypto.createHash('sha256').update(`${str}:${HASH_SALT}`).digest('hex');
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

        // Parse IP securely from Vercel trusted headers
        const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const clientIp = rawIp.split(',')[0].trim();
        const ipHash = hashString(clientIp);
        const emailHash = hashString(email.toLowerCase().trim());
        const userAgent = req.headers['user-agent'] || 'Unknown';

        // 1. Check Rate Limits
        const limitDocRef = doc(db, 'authSecurity', ipHash);
        const limitSnap = await getDoc(limitDocRef);
        const now = Date.now();

        if (limitSnap.exists()) {
            const data = limitSnap.data();
            const blockedUntil = new Date(data.blockedUntil || 0).getTime();

            if (now < blockedUntil) {
                // Blocked. Do not verify password. Log block event.
                await setDoc(doc(collection(db, 'adminLogs')), {
                    type: "login_blocked",
                    timestamp: new Date().toISOString(),
                    ipHash,
                    emailHash,
                    userAgent,
                    reason: "Too many failed attempts. Rate limit enforced.",
                    blocked: true
                });

                return res.status(429).json({
                    error: "Too many unsuccessful login attempts. Please try again later."
                });
            }
        }

        // 2. Safely Verify Credentials against Firebase REST Identity Toolkit
        const verifyRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, returnSecureToken: true })
        });

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok) {
            // 3. Increment Failed Attempts
            const currentFails = limitSnap.exists() ? (limitSnap.data().failedAttempts || 0) : 0;
            const newFails = currentFails + 1;
            let newBlockedUntil = 0;
            let blockedEvent = false;

            if (newFails >= MAX_ATTEMPTS) {
                newBlockedUntil = now + BLOCK_DURATION_MS;
                blockedEvent = true;
            }

            await setDoc(limitDocRef, {
                failedAttempts: newFails,
                lastFailedAt: new Date(now).toISOString(),
                blockedUntil: newBlockedUntil ? new Date(newBlockedUntil).toISOString() : 0,
                updatedAt: new Date(now).toISOString()
            }, { merge: true });

            // Log Failed Attempt
            await setDoc(doc(collection(db, 'adminLogs')), {
                type: blockedEvent ? "login_blocked" : "login_failed",
                timestamp: new Date().toISOString(),
                ipHash,
                emailHash,
                userAgent,
                reason: "Invalid email or password.",
                blocked: blockedEvent
            });

            // Email enumeration protection: keep message generic
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // 4. Verification Succeeded! Reset rate limits.
        if (limitSnap.exists()) {
            await setDoc(limitDocRef, {
                failedAttempts: 0,
                blockedUntil: 0,
                updatedAt: new Date(now).toISOString()
            }, { merge: true });
        }

        // Also Log Success
        await setDoc(doc(collection(db, 'adminLogs')), {
            type: "login_success",
            timestamp: new Date().toISOString(),
            ipHash,
            emailHash,
            uid: verifyData.localId,
            userAgent,
            reason: "Successful login.",
            blocked: false
        });

        // We do NOT return the idToken. We just tell the frontend it's safe to proceed logging in natively.
        return res.status(200).json({ success: true, message: "OK" });

    } catch (error) {
        console.error('[Admin Login Proxy Error]', error);
        return res.status(500).json({ error: "Unable to sign in. Please try again." });
    }
}
