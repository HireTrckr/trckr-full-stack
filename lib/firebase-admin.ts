import admin, { ServiceAccount } from 'firebase-admin';

const serviceAccount: ServiceAccount = {
  //type: 'service_account',
  projectId: process.env.FIREBASE_PROJECT_ID,
  //private_key_id: 'b1f05ec39d8db92d04c97d027fa5e549afff85c7',
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  //client_id: '113596655905448389085',
  //auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  //token_uri: 'https://oauth2.googleapis.com/token',
  //auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  //client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40jobtrackerapp-f5056.iam.gserviceaccount.com',
  //universe_domain: 'googleapis.com',
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
