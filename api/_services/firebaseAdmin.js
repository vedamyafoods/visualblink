import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0];
    }

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    // Handle escaped newlines in Vercel environment vars for private keys
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
        ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined;

    if (!projectId || !clientEmail || !privateKey) {
        console.warn('Firebase Admin SDK missing credentials. Standard Firebase Client SDK will be used as fallback or errors may occur.');
        return undefined;
    }

    // Safely remove any surrounding quotes that might have been pasted into Vercel
    let cleanPrivateKey = privateKey;
    if (cleanPrivateKey.startsWith('"') && cleanPrivateKey.endsWith('"')) {
        cleanPrivateKey = cleanPrivateKey.slice(1, -1);
    }
    if (cleanPrivateKey.startsWith("'") && cleanPrivateKey.endsWith("'")) {
        cleanPrivateKey = cleanPrivateKey.slice(1, -1);
    }

    try {
        return initializeApp({
            credential: cert({
                projectId: projectId.trim(),
                clientEmail: clientEmail.trim(),
                privateKey: cleanPrivateKey
            }),
            projectId: projectId.trim()
        });
    } catch (err) {
        console.error('Firebase Admin Init Error:', err.message);
        return undefined;
    }
}

export const adminApp = getAdminApp();

export const adminAuth = adminApp ? getAuth(adminApp) : null;
export const adminDb = adminApp ? getFirestore(adminApp) : null;
