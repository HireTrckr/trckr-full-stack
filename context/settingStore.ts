import { create } from 'zustand';
import { DEFAULT_SETTINGS, Settings } from '../types/settings';
import { auth } from '../lib/firebase';
import { TailwindColor } from '../types/tailwindColor';
import { settingsApi } from '../lib/api';

import colors from 'tailwindcss/colors';
import { useToastStore } from './toastStore';
import { ToastCategory } from '../types/toast';
import { TimestampsFromJSON } from '../utils/dateUtils';

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
      // Use the API client instead of direct Firebase access
      const settings = await settingsApi.fetchSettings();
      settings.timestamps = TimestampsFromJSON(settings.timestamps);

      applyTailwindThemeColor(settings.theme.primaryColor);

      set({ settings });
    } catch (error: unknown) {
      console.error('[settingStore.ts] Error fetching settings:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      useToastStore
        .getState()
        .createTranslatedToast(
          'toasts.errors.fetchSettings',
          true,
          'toasts.titles.error',
          { message: errorMessage },
          {},
          ToastCategory.ERROR,
          10000
        );
      set({ error: `Failed to fetch settings: ${errorMessage}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },

  updateSettings: async (newSettings: Settings) => {
    if (!auth.currentUser) return false;
    if (!get().settings) return false;

    const currentSettings = get().settings;

    set({ isLoading: true, error: null });
    try {
      // Use the API client instead of direct Firebase access
      const updatedSettings = await settingsApi.updateSettings(newSettings);

      set({ settings: updatedSettings });
      applyTailwindThemeColor(updatedSettings.theme.primaryColor);

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
    } catch (error: unknown) {
      console.error('[settingStore.ts] Error updating settings:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      useToastStore
        .getState()
        .createTranslatedToast(
          'toasts.errors.updateSettings',
          true,
          'toasts.titles.error',
          { message: errorMessage },
          {},
          ToastCategory.ERROR,
          10000
        );
      set({ error: `Failed to update settings: ${errorMessage}` });
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

    set({ isLoading: true, error: null });
    try {
      // Use the API client instead of direct Firebase access
      const newSettings = await settingsApi.updateSetting(key, value);

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
    } catch (error: unknown) {
      console.error('[settingStore.ts] Error updating settings:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      useToastStore
        .getState()
        .createTranslatedToast(
          'toasts.errors.updateSettings',
          true,
          'toasts.titles.error',
          { message: errorMessage },
          {},
          ToastCategory.ERROR,
          10000
        );
      set({ error: `Failed to update settings: ${errorMessage}` });
    } finally {
      set({ isLoading: false });
    }
    return !get().error;
  },
}));
