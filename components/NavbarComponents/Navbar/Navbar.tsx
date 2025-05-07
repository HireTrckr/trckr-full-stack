import React, { JSX } from 'react';
import Link from 'next/link';
import { SearchBar } from '../SearchBar/SearchBar';
import { UserThumbnail } from '../UserThumbnail/UserThumbnail';
import { useTranslation } from 'react-i18next';
import { LanguageSelectorComponent } from '../../LanguageSelectorComponent/LanguageSelectorComponent';
import { useSettingsStore } from '../../../context/settingStore';
import i18n from '../../../lib/i18n';
import Image from 'next/image';

export function Navbar(): JSX.Element {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettingsStore.getState();

  return (
    <nav className="sticky top-0 bg-background-primary border-b border-background-secondary text-text-primary transition-colors duration-text ease-in-out grid grid-cols-[1fr_auto_1fr_auto] w-full items-center p-1 shadow-light z-50 min-h-[3rem] max-h-[3rem] max-h-[3rem]">
      <div className="flex items-center gap-2">
        <Link href="/" className="justify-self-start max-h-full h-full">
          <div className="flex items-center space-x-2 p-1 h-full">
            <Image
              src="/HireTrckr.png"
              alt="Trckr Logo"
              width={16}
              height={16}
              className="max-h-[1rem] rounded-[50%]"
            />
            <h1 className="text-lg font-semibold text-text-primary transition-colors duration-text">
              Trckr
            </h1>
          </div>
        </Link>
        <LanguageSelectorComponent
          defaultLanguage={settings.preferences.language}
          onSelect={(language) => {
            // set the react-i18next language
            i18n.changeLanguage(language);

            // updated users saved preferences - zustand store handles permissions
            updateSetting('preferences', {
              ...settings.preferences,
              language,
            });
          }}
        />
      </div>

      <div className="flex items-center gap-2 mx-auto">
        <Link
          href="/list"
          className="text-text-primary hover:text-text-secondary transition-colors duration-text capitalize text-nowrap"
        >
          {t('navbar.track')}
        </Link>
        <span className="text-text-secondary transition-all duration-text">
          |
        </span>
        <Link
          href="/new"
          className="text-text-primary hover:text-text-secondary transition-colors duration-text capitalize text-nowrap"
        >
          {t('navbar.add-new')}
        </Link>
        <span className="text-text-secondary transition-all duration-text">
          |
        </span>
        <Link
          href="/settings"
          className="text-text-primary hover:text-text-secondary transition-colors duration-text capitalize text-nowrap"
        >
          {t('navbar.settings')}
        </Link>
      </div>

      <SearchBar />

      <UserThumbnail />
    </nav>
  );
}
