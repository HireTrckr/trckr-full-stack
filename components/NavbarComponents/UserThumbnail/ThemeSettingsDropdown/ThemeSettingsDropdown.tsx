import React, { JSX } from 'react';
import { ThemeToggle } from '../../../themeToggle/themeToggle';
import { useTranslation } from 'react-i18next';

export function ThemeSettingsDropdown(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="hover:bg-background-secondary py-2">
      <div className="flex justify-center">
        <span className="text-text-secondary transition-colors duration-text text-xs">
          {t('navbar.dropdown.theme-toggle-title')}
        </span>
      </div>
      <div className="flex justify-center items-center w-full">
        <ThemeToggle />
      </div>
    </div>
  );
}
