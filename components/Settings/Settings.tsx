import { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useSettingsStore } from '../../context/settingStore';

export function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const settings = useSettingsStore((state) => state.settings);

  // get the current user's settings
  useEffect(() => {}, []);

  if (isLoading) {
    return <p className="text-text-secondary">Loading...</p>;
  }

  return (
    <div className="text-text-primary transform duration-text">
      <div className="flex flex-col items-center">
        <span className="text-md text-text-secondary">Preferences</span>
        {JSON.stringify(settings)}
      </div>
      <div className="flex flex-col items-center">
        <span className="text-md text-text-secondary">Tags</span>
      </div>
    </div>
  );
}
