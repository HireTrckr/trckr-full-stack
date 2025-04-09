import React, { JSX } from 'react';

export function SettingsSkeleton(): JSX.Element {
  return (
    <div className="text-text-primary transition-all duration-bg w-full flex flex-col gap-4 items-center bg-background-primary">
      <span className="text-2xl font-semibold text-text-primary flex items-center transition-colors duration-text">
        Settings
      </span>
      <div
        className="grid grid-cols-2 w-full gap-4"
        id="SKELETON-settings-column-container"
      >
        <div
          className="flex flex-col items-start w-full ring-2 ring-background-secondary rounded-lg p-4 transition-all duration-bg min-h-[16rem]"
          id="SKELETON-settings-theme-container"
        ></div>
        <div
          className="flex flex-col items-start w-full ring-2 ring-background-secondary rounded-lg p-4 transition-all duration-bg"
          id="SKELETON-settings-tag-editor-container"
        ></div>
        <div
          className="w-full ring-2 ring-background-secondary rounded-lg p-4 transition-all duration-bg min-h-[16rem]"
          id="SKELETON-settings-status-editor-container"
        ></div>
        <div
          className="w-full ring-2 ring-background-secondary rounded-lg p-4 transition-all duration-bg"
          id="SKELETON-settings-field-editor-container"
        ></div>
      </div>
    </div>
  );
}
