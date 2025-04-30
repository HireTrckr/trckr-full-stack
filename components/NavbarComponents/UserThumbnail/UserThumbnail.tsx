import { useEffect, useState, useRef } from 'react';
import { auth } from '../../../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithGoogle } from '../../../utils/authUtils';
import { ThemeSettingsDropdown } from './ThemeSettingsDropdown/ThemeSettingsDropdown';
import { AccountSettingsThumbnail } from './AccountSettingsThumbnail/AccountSettingsThumbnail';
import { TiThMenu, TiDeleteOutline } from 'react-icons/ti';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '../../themeToggle/themeToggle';

export function UserThumbnail() {
  const [user] = useAuthState(auth);
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isClient) {
    return null;
  }

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
              <TiThMenu
                onClick={() => setIsOpen(true)}
                className="transition-colors duration-text text-text-primary"
              />
            )}
            {isOpen && (
              <TiDeleteOutline
                onClick={() => setIsOpen(false)}
                className="transition-colors duration-text text-text-primary"
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
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="gsi-material-button" onClick={signInWithGoogle}>
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  style={{ display: 'block' }}
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">
                {t('common.auth.sign-in')}
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
