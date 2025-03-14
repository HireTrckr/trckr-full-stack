import React, { JSX } from 'react';
import { ThemeToggle } from '../themeToggle/themeToggle';

export function ThemeSettingsDropdown(): JSX.Element {
  return (
    <div className="hover:bg-background-secondary py-2">
      <div className="flex justify-center">
        <span className="text-text-secondary transition-colors duration-text text-xs">
          UI Theme
        </span>
      </div>
      <div className="flex justify-evenly items-center">
        <div className="flex justify-between items-center gap-1">
          <label
            htmlFor="useSystemThemeCheckbox"
            className="text-xs text-text-primary text-center h-full transition-colors duration-text"
          >
            Use System Theme?
          </label>
          <input
            type="checkbox"
            disabled
            id="useSystemThemeCheckbox"
            checked={true}
            className="rounded border-background-secondary"
          />
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
