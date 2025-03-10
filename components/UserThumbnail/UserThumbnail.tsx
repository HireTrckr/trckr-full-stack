import { useEffect, useState, useRef } from "react";
import { auth } from "../../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { ThemeSettingsDropdown } from "../ThemeSettingsDropdown/ThemeSettingsDropdown";
import { AccountSettingsThumbnail } from "../AccountSettingsThumbnail/AccountSettingsThumbnail";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoIosClose } from "react-icons/io";

export function UserThumbnail() {
  const [user] = useAuthState(auth);
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [useSystemTheme, setUseSystemTheme] = useState(() => {
    if (window && typeof window !== "undefined") {
      const systemOverride = localStorage.getItem("useSystemTheme"); // true or false
      return systemOverride ? JSON.parse(systemOverride) : true;
    }
    return true;
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
    <div className="relative justify-self-end" ref={dropdownRef}>
      {user ? (
        <>
          <button
            className="flex items-center gap-2 p-1.5 rounded-lg
                     bg-background-primary hover:bg-background-secondary
                     transition-all duration-bg ease-in-out"
          >
            {!isOpen && (
              <GiHamburgerMenu
                onClick={() => setIsOpen(true)}
                className="text-text-primary transition-colors duration-text"
              />
            )}
            {isOpen && (
              <IoIosClose
                onClick={() => setIsOpen(false)}
                className="text-text-primary transition-colors duration-text"
              />
            )}
          </button>

          {isOpen && (
            <div
              className="absolute right-0 w-64
                        bg-background-primary border border-background-secondary
                        rounded-lg shadow-light
                        transition-all duration-bg ease-in-out z-10"
              onMouseEnter={() => setIsOpen(true)}
            >
              <ThemeSettingsDropdown />
              <div className="border-t border-background-secondary transition duration-bg"></div>
              <AccountSettingsThumbnail />
            </div>
          )}
        </>
      ) : (
        <button
          onClick={signInWithGoogle}
          className="px-3 py-1.5 rounded-lg text-sm font-medium
                     bg-accent-primary hover:bg-accent-hover
                     text-white
                     transition-all duration-text ease-in-out
                     flex items-center gap-2 shadow-light
                       "
        >
          Sign In
        </button>
      )}
    </div>
  );
}
