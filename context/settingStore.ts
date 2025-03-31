import { create } from 'zustand';
import { DEFAULT_SETTINGS, Settings } from '../types/settings';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type SettingsStore = {
  settings: Settings;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<boolean>;
  updateSettings: <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => Promise<boolean>;
  getSettingDisplayName: (key: string) => string;
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    if (!auth.currentUser) return false;

    set({ isLoading: true, error: null });
    try {
      const settingsRef = doc(
        db,
        `users/${auth.currentUser.uid}/metadata/settings`
      );
      const settingsDoc = await getDoc(settingsRef);

      if (!settingsDoc.exists()) {
        console.warn('[settingsStore.ts] No settings file found');
        await setDoc(settingsRef, { settings: DEFAULT_SETTINGS });
        set({ settings: DEFAULT_SETTINGS, isLoading: false });
        return true;
      }

      const settingsData = settingsDoc.data();

      if (!settingsData) {
        console.warn('[settingsStore.ts] No settings data found');
        await setDoc(settingsRef, { settings: DEFAULT_SETTINGS });
        set({ settings: DEFAULT_SETTINGS, isLoading: false });
        return true;
      }

      const settings = {
        ...DEFAULT_SETTINGS,
        ...settingsData.settings,
      } as Settings;

      settings.theme.primaryColor = 'red';

      document.documentElement.style.setProperty(
        '--accent-color',
        settings.theme.primaryColor
      );

      set({ settings });
    } catch (error) {
      console.error('[tagStore.ts] Error fetching tags:', error);
      set({ error: `Failed to fetch tags: ${error}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },

  getSettingDisplayName: (key: string) => {
    // undo camel case
    const words = key.split(/(?=[A-Z])/);
    const capitalizedWords = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    );
    const displayName = capitalizedWords.join(' ');
    return displayName.replace(/([a-z])([A-Z])/g, '$1 $2');
  },

  updateSettings: async (key, value) => {
    if (!auth.currentUser) return false;

    if (!get().settings) return false;

    if (!(key && value)) return false;

    if (!(key in get().settings)) return false;

    const newSettings: Settings = {
      ...get().settings,
      [key]: value,
      timestamps: {
        ...get().settings.timestamps,
        updatedAt: new Date(),
      },
    };

    set({ settings: newSettings });
    return true;
  },
}));
