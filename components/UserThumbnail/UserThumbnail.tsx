import React, { useEffect } from "react";
import { auth } from "../../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

export default function UserThumbnail() {
  const [user] = useAuthState(auth);
  const [isClient, setIsClient] = React.useState(false);

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
    <div>
      {user ? (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold ">
            Hello, {user.displayName || "User"}
          </span>
          <img
            src={user.photoURL || ""}
            alt={user.displayName || ""}
            referrerPolicy="no-referrer"
            className="w-[15px] h-[15px] rounded-full"
          />
        </div>
      ) : (
        <button onClick={signInWithGoogle}>Sign In</button>
      )}
    </div>
  );
}
