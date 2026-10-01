import { adminAuth } from './api/_services/firebaseAdmin.js';

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error('❌ Please provide the email address you want to make an admin!');
    console.error('Usage: node make-admin.js <email>');
    process.exit(1);
  }

  try {
    if (!adminAuth) {
      console.error('❌ Firebase Admin SDK is not initialized. Check your .env credentials.');
      process.exit(1);
    }

    const user = await adminAuth.getUserByEmail(email);

    // Retrieve existing claims to not overwrite them
    const currentClaims = user.customClaims || {};

    await adminAuth.setCustomUserClaims(user.uid, {
      ...currentClaims,
      admin: true
    });

    console.log(`✅ Successfully elevated ${email} to Admin Status!`);
    console.log(`🔒 The Firebase Custom Claim 'admin: true' has been securely attached to this UID (${user.uid}).`);
    console.log(`\nNote: If you have the portal open, you may need to force-refresh to update the active token state.`);
    process.exit(0);
  } catch (e) {
    console.error(`❌ Failed to elevate user:`, e.message);
    process.exit(1);
  }
}

makeAdmin();
