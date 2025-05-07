import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../../lib/firebase';
import Link from 'next/link';
import { handleSignOut } from '../../../../utils/authUtils';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

export function AccountSettingsThumbnail() {
  const [user] = useAuthState(auth);
  const { t } = useTranslation();

  return (
    <div className="hover:bg-background-secondary py-2">
      <div className="flex justify-center">
        <span className="text-text-secondary transition-colors duration-text text-xs">
          {t('navbar.dropdown.account-settings-title')}
        </span>
      </div>
      <div className="flex items-center justify-evenly">
        <Link
          href="/settings"
          className="flex items-center gap-2 p-1.5 px-2 py-1 h-7 bg-accent-primary rounded-lg hover:brightness-[80%] transition-colors duration-text"
        >
          <span className="text-xs text-text-accent transition-colors duration-text">
            {t('settings.title')}
          </span>
          <Image
            src={user?.photoURL || ''}
            alt={user?.displayName || ''}
            width={16}
            height={16}
            referrerPolicy="no-referrer"
            className="aspect-square max-h-[1rem] rounded-full"
          />
        </Link>
        <button
          onClick={handleSignOut}
          className="text-center px-2 py-1 h-7 text-sm rounded-lg text-text-accent bg-accent-primary hover:brightness-[80%] transition-colors duration-text text-xs"
        >
          {t('common.auth.sign-out')}
        </button>
      </div>
    </div>
  );
}
