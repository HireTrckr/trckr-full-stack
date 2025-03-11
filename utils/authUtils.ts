import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (error.code === "auth/popup-closed-by-user") {
      return;
    }
    console.error("Login failed", error);
  }
};

export const handleSignOut = async () => {
  auth.signOut();
};
