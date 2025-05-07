import { create } from 'zustand';
import { DEFAULT_SETTINGS, Settings } from '../types/settings';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { TailwindColor } from '../types/tailwindColor';

import colors from 'tailwindcss/colors';
import { useToastStore } from './toastStore';
import { ToastCategory } from '../types/toast';

type SettingsStore = {
  settings: Settings;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<boolean>;
  updateSetting: <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => Promise<boolean>;
  updateSettings: (newSettings: Settings) => Promise<boolean>;
};

export const applyTailwindThemeColor = (
  color: TailwindColor = DEFAULT_SETTINGS.theme.primaryColor
) => {
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty(
      '--accent-color',
      colors[color.tailwindColorName][500]
    );
    document.documentElement.style.setProperty(
      '--text-accent',
      color.textColor
    );
  }
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: true,
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

      applyTailwindThemeColor(settings.theme.primaryColor);

      set({ settings });
    } catch (error) {
      console.error('[tagStore.ts] Error fetching settings:', error);
      useToastStore
        .getState()
        .createTranslatedToast(
          'toasts.errors.fetchSettings',
          true,
          'toasts.titles.error',
          { message: (error as Error).message },
          {},
          ToastCategory.ERROR,
          10000
        );
      set({ error: `Failed to fetch settings: ${error}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },

  updateSettings: async (newSettings: Settings) => {
    if (!auth.currentUser) return false;
    if (!get().settings) return false;

    const currentSettings = get().settings;

    const updatedSettings: Settings = {
      ...currentSettings,
      ...newSettings,
      timestamps: {
        ...currentSettings.timestamps,
        updatedAt: new Date(),
      },
    };

    set({ isLoading: true, error: null });
    try {
      await updateDoc(
        doc(db, `users/${auth.currentUser.uid}/metadata/settings`),
        {
          settings: updatedSettings,
        }
      );

      set({ settings: newSettings });
      applyTailwindThemeColor(newSettings.theme.primaryColor);
      useToastStore.getState().createTranslatedToast(
        'toasts.settingsUpdated',
        true,
        'toasts.titles.settingsUpdated',
        {},
        {},
        ToastCategory.INFO,
        3000,
        () => {},
        (toast) => {
          // undo function
          get().updateSettings(currentSettings);
        }
      );
    } catch (error) {
      console.error('[settingsStore.ts] Error updating settings:', error);
      useToastStore
        .getState()
        .createTranslatedToast(
          'toasts.errors.updateSettings',
          true,
          'toasts.titles.error',
          { message: (error as Error).message },
          {},
          ToastCategory.ERROR,
          10000
        );
      set({ error: `Failed to update settings: ${error}` });
    } finally {
      set({ isLoading: false });
    }
    return !get().error;
  },

  updateSetting: async (key, value) => {
    if (!auth.currentUser) return false;

    if (!get().settings) return false;

    if (!(key && value)) return false;

    if (!(key in get().settings)) return false;

    const currentSettings = get().settings;

    const newSettings: Settings = {
      ...currentSettings,
      [key]: value,
      timestamps: {
        ...currentSettings.timestamps,
        updatedAt: new Date(),
      },
    };

    set({ isLoading: true, error: null });
    try {
      await updateDoc(
        doc(db, `users/${auth.currentUser.uid}/metadata/settings`),
        {
          settings: newSettings,
        }
      );

      set({ settings: newSettings });
      applyTailwindThemeColor(newSettings.theme.primaryColor);
      useToastStore.getState().createTranslatedToast(
        'toasts.settingsUpdated',
        true,
        'toasts.titles.settingsUpdated',
        {},
        {},
        ToastCategory.INFO,
        3000,
        () => {},
        (toast) => {
          // undo function
          get().updateSettings(currentSettings);
        }
      );
    } catch (error) {
      console.error('[settingsStore.ts] Error updating settings:', error);
      useToastStore
        .getState()
        .createTranslatedToast(
          'toasts.errors.updateSettings',
          true,
          'toasts.titles.error',
          { message: (error as Error).message },
          {},
          ToastCategory.ERROR,
          10000
        );
      set({ error: `Failed to update settings: ${error}` });
    } finally {
      set({ isLoading: false });
    }
    return !get().error;
  },
}));
