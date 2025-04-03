import React, { JSX } from 'react';
import { ThemeToggle } from '../themeToggle/themeToggle';

export function ThemeSettings(): JSX.Element {
  return (
    <div className="w-full flex justify-evenly items-center gap-4">
      <span className="text-text-primary text-md transition-all duration-text min-w-[25%]">
        Dark Mode
      </span>
      <ThemeToggle className="flex-1" />
    </div>
  );
}
