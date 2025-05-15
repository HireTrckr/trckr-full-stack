import { Timestamp } from 'firebase/firestore';
import { getDefaultTailwindColorObject } from '../utils/getTailwindColorObject';
import { TailwindColor } from './tailwindColor';
import { timestamps } from './timestamps';

export type SupportedLanguage = 'en' | 'fr' | 'es' | 'zh-HK' | 'zh-CN';

export type Settings = {
  theme: {
    mode: 'light' | 'dark' | 'auto';
    primaryColor: TailwindColor;
  };

  preferences: {
    language: SupportedLanguage;
  };

  timestamps: timestamps;
};

export const DEFAULT_SETTINGS: Settings = {
  theme: {
    mode: 'light',
    primaryColor: getDefaultTailwindColorObject(),
  },

  preferences: {
    language: 'en',
  },

  timestamps: {
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
    deletedAt: null,
  },
};
