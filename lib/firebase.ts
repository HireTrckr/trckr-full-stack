import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDtUnhFdKXZHXaZ9KrA6PtYbPafAVEOZwc',
  authDomain: 'jobtrackerapp-f5056.firebaseapp.com',
  projectId: 'jobtrackerapp-f5056',
  storageBucket: 'jobtrackerapp-f5056.firebasestorage.app',
  messagingSenderId: '325843048066',
  appId: '1:325843048066:web:55612be6606f1ed6c9469b',
};

const app = initializeApp(firebaseConfig);
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
