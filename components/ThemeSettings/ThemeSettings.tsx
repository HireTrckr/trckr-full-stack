import React, { JSX } from 'react';
import { ThemeToggle } from '../themeToggle/themeToggle';
import { useTranslation } from 'react-i18next';

export function ThemeSettings(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center">
      <span className="text-text-primary text-sm transition-all duration-text min-w-[25%]">
        {t('settings.preferences.theme.dark-mode')}
      </span>
      <ThemeToggle />
    </div>
  );
}
