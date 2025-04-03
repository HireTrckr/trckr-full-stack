import { getTailwindColorObjectFromName } from '../utils/getTailwindColorObject';
import { TailwindColor } from './tailwindColor';
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
    primaryColor: getTailwindColorObjectFromName('sky'),
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
