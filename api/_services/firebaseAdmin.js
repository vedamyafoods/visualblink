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

    try {
        return initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey
            }),
            projectId
        });
    } catch (err) {
        console.error('Firebase Admin SDK Initialization Error:', err);
        return undefined;
    }
}

export const adminApp = getAdminApp();

export const adminAuth = adminApp ? getAuth(adminApp) : null;
export const adminDb = adminApp ? getFirestore(adminApp) : null;
