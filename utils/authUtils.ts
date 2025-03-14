import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';

import { useJobStore } from '../context/jobStore';
import { useTagStore } from '../context/tagStore';

export const signInWithGoogle = async () => {
  useJobStore.getState().clearJobs();
  useTagStore.getState().clearTags();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      return;
    }
    console.error('Login failed', error);
  }
};

export const handleSignOut = async () => {
  auth.signOut();

  // clear jobs and tags from jobStore and tagStore
  useJobStore.getState().clearJobs();
  useTagStore.getState().clearTags();
};
