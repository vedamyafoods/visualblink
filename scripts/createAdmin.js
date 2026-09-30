import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Usage: node scripts/createAdmin.js <email> <password> <service-account-json-path>
const args = process.argv.slice(2);
const email = args[0];
const password = args[1];
const serviceAccountPath = args[2];

if (!email || !password || !serviceAccountPath) {
    console.log("Usage: node scripts/createAdmin.js <email> <password> <service-account.json>");
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(serviceAccountPath), 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function makeAdmin() {
    try {
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(email);
            console.log(`User ${email} already exists. Updating password and claims...`);
            await admin.auth().updateUser(userRecord.uid, { password });
        } catch (e) {
            if (e.code === 'auth/user-not-found') {
                console.log(`Creating new admin user: ${email}...`);
                userRecord = await admin.auth().createUser({
                    email: email,
                    password: password,
                    emailVerified: true
                });
            } else {
                throw e;
            }
        }

        // Assign admin role custom claim
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'admin' });

        console.log(`Successfully assigned admin claim to user: ${userRecord.uid}`);
        console.log("This user can now login to the /admin route securely.");
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin user:", error);
        process.exit(1);
    }
}

makeAdmin();
