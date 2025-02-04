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
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm p-1 rounded-lg transition flex flex-row items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </>
      )}
    </div>
  );
}
