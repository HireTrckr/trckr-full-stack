import React, { JSX } from 'react';
import { ThemeToggle } from '../themeToggle/themeToggle';

export function ThemeSettings(): JSX.Element {
  return (
    <div className="flex justify-between items-center">
      <span className="text-text-primary text-sm transition-all duration-text min-w-[25%]">
        Dark Mode
      </span>
      <ThemeToggle />
    </div>
  );
}
