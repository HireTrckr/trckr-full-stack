import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import React, { JSX } from "react";
import { auth } from "../../lib/firebase";
import Link from "next/link";

export default function AccountSettingsThumbnail(): JSX.Element {
  const [user] = useAuthState(auth);

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div className="hover:bg-background-secondary py-2">
      <div className="flex justify-center">
        <span className="text-text-secondary transition-colors duration-text text-xs">
          Account
        </span>
      </div>
      <div className="flex items-center justify-evenly">
        <Link
          href="/settings"
          className="flex items-center gap-2 p-1.5 px-2 py-1 h-7 bg-accent-primary rounded-lg hover:bg-accent-hover transition-colors duration-text"
        >
          <span className="text-xs text-text-white transition-colors duration-text">
            Settings
          </span>
          <img
            src={user?.photoURL || ""}
            alt={user?.displayName || ""}
            referrerPolicy="no-referrer"
            className="w-[15px] h-[15px] rounded-full ring-1 ring-background-secondary"
          />
        </Link>
        <button
          onClick={handleSignOut}
          className="text-center px-2 py-1 h-7 text-sm rounded-lg
                         text-white bg-accent-primary hover:bg-accent-hover
                         transition-colors duration-text text-xs"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
