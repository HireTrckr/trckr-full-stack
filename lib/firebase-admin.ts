import admin, { ServiceAccount } from 'firebase-admin';

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Check if the app has already been initialized to prevent multiple initializations
const adminFireBaseConfig = {
  credential: admin.credential.cert(serviceAccount),
};

if (!admin.apps.length) {
  try {
    admin.initializeApp(
      adminFireBaseConfig,
      process.env.FIREBASE_ADMIN_APP_NAME
    );
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

// Get a reference to the initialized app
const adminApp = admin.app(process.env.FIREBASE_ADMIN_APP_NAME);

// Export the Firestore instance from the named app
export const adminDb = adminApp.firestore();
