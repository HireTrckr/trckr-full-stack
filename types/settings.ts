import { TailwindColor } from '../utils/generateRandomColor';
import { timestamps } from './timestamps';

export type Settings = {
  theme: {
    mode: 'light' | 'dark' | 'auto';
    primaryColor: TailwindColor;
  };

  preferences: {
    language: string;
    timezone: string;
  };

  timestamps: timestamps;
};

export const DEFAULT_SETTINGS: Settings = {
  theme: {
    mode: 'light',
    primaryColor: 'blue',
  },

  preferences: {
    language: 'en',
    timezone: 'GMT',
  },

  timestamps: {
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};
