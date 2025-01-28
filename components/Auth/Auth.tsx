import { auth } from "../../lib/firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Auth() {
  const [user] = useAuthState(auth);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const signInWithGoogle = async () => {
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

  return (
      <div className="rounded-lg shadow-md max-w-sm text-center rounded-lg items-center justify-center">
        {user ? (
          <>
            <h1 className="text-xl text-black font-bold mb-4">
              Welcome, {user.displayName}
            </h1>
            <button
              onClick={() => signOut(auth)}
              className="w-full bg-red-500 hover:bg-red-600 text-black p-1 text-lg rounded-lg transition"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={signInWithGoogle}
              className="w-full bg-blue-500 hover:bg-blue-600 text-black text-sm p-1 rounded-lg transition"
            >
              Sign in with Google
            </button>
          </>
        )}
    </div>
  );
}
