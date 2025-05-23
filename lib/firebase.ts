import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if an instance doesn't already exist

function initialiseClientFirebaseApp(appName: string | undefined) {
  console.log('Firebase Client initialized successfully');
  return initializeApp(firebaseConfig, appName);
}

const app =
  getApps().length > 0
    ? getApp(process.env.NEXT_PUBLIC_FIREBASE_CLIENT_APP_NAME)
    : initialiseClientFirebaseApp(
        process.env.NEXT_PUBLIC_FIREBASE_CLIENT_APP_NAME
      );

const db = getFirestore(app);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const signIn = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Google sign-in error', error);
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    window.location.reload();
  } catch (error) {
    console.error('Logout error', error);
  }
};

export { db, auth, signIn, logout };
