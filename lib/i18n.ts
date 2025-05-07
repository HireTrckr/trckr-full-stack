// lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useSettingsStore } from '../context/settingStore';

// Import your translation files
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import zhHK from '../locales/zh-hk.json';
import zhCN from '../locales/zh-cn.json';
import es from '../locales/es.json';

// Initialize i18next
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    'zh-HK': { translation: zhHK },
    'zh-CN': { translation: zhCN },
    es: { translation: es },
  },
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Add subscription to language changes
if (typeof window !== 'undefined')
  useSettingsStore.subscribe((state) => {
    const language = state.settings.preferences.language;
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  });

export default i18n;
