import { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useSettingsStore } from '../../context/settingStore';
import { ThemeSettingsDropdown } from '../ThemeSettingsDropdown/ThemeSettingsDropdown';

export function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const settings = useSettingsStore((state) => state.settings);
  const getSettingDisplayName = useSettingsStore(
    (state) => state.getSettingDisplayName
  );

  // get the current user's settings
  useEffect(() => {}, []);

  if (isLoading) {
    return <p className="text-text-secondary">Loading...</p>;
  }

  return (
    <div className="text-text-primary transform duration-text w-full">
      <div className="flex flex-col items-center px-4">
        <span className="text-2xl font-semibold text-text-primary flex items-center transition-colors duration-text">
          Settings
        </span>
        <div className="flex flex-col items-start w-full">
          <span className="text-xs text-text-secondary">Theme</span>

          <span className="text-sm text-text-primary">
            {Object.keys(settings.theme).map((key: string) => (
              <div key={key} className="flex items-center">
                <span className="text-sm text-text-primary capitalize">
                  {`${getSettingDisplayName(key)}: ${settings.theme[key as keyof typeof settings.theme]}`}
                </span>
              </div>
            ))}
          </span>
        </div>
        <div className="flex flex-col items-start w-full">
          <span className="text-xs text-text-secondary">Preferences</span>
          <span className="text-sm text-text-primary">
            {JSON.stringify(settings.preferences)}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-md text-text-secondary">Tags</span>
      </div>
    </div>
  );
}
