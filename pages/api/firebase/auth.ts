// pages/api/firebase/auth.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

// Initialize Firebase with server-side environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { action, email, password } = req.body;

  try {
    let result;

    switch (action) {
      case 'signin':
        result = await signInWithEmailAndPassword(auth, email, password);
        return res.status(200).json({
          user: {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
          },
          token: await result.user.getIdToken(),
        });

      case 'signup':
        result = await createUserWithEmailAndPassword(auth, email, password);
        return res.status(200).json({
          user: {
            uid: result.user.uid,
            email: result.user.email,
          },
          token: await result.user.getIdToken(),
        });

      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    const errorCode = error && typeof error === 'object' && 'code' in error 
      ? (error.code as string) 
      : 'unknown_error';
      
    return res.status(500).json({
      message: errorMessage,
      code: errorCode,
    });
  }
}
