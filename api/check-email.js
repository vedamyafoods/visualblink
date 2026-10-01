import { adminDb } from './_services/firebaseAdmin.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!adminDb) {
            return res.status(500).json({ error: 'Firestore Admin not initialized' });
        }

        const snap = await adminDb.collection('users').where('email', '==', normalizedEmail).get();

        // Explicitly return true or false so the frontend can intercept
        if (snap.empty) {
            return res.status(200).json({ exists: false });
        }

        // Exists! We can optionally return the provider for proper routing
        const doc = snap.docs[0].data();
        return res.status(200).json({ exists: true, provider: doc.provider || 'password' });

    } catch (error) {
        console.error('Email check error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
