import { useTheme } from '../context/themeContext';
import { ThemeColors, themeConfig } from '../styles/theme';

export const useThemeColors = (): ThemeColors => {
  const { theme } = useTheme();

  if (window && typeof window !== 'undefined') {
    return {
      backgroundPrimary: getComputedStyle(
        document.documentElement
      ).getPropertyValue('--background-primary'),
      backgroundSecondary: getComputedStyle(
        document.documentElement
      ).getPropertyValue('--background-secondary'),
      textPrimary: getComputedStyle(document.documentElement).getPropertyValue(
        '--text-primary'
      ),
      textSecondary: getComputedStyle(
        document.documentElement
      ).getPropertyValue('--text-secondary'),
      accentColor: getComputedStyle(document.documentElement).getPropertyValue(
        '--accent-color'
      ),
    };
  }

  // SSR
  return themeConfig[theme];
};
