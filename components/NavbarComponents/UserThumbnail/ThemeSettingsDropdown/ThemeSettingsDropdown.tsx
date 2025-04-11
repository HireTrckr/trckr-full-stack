import React, { JSX } from 'react';
import { ThemeToggle } from '../../../themeToggle/themeToggle';

export function ThemeSettingsDropdown(): JSX.Element {
  return (
    <div className="hover:bg-background-secondary py-2">
      <div className="flex justify-center">
        <span className="text-text-secondary transition-colors duration-text text-xs">
          UI Theme
        </span>
      </div>
      <div className="flex justify-center items-center w-full">
        <ThemeToggle />
      </div>
    </div>
  );
}
