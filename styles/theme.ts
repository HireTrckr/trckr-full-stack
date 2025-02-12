export const themeConfig = {
  light: {
    backgroundPrimary: "#ffffff",
    backgroundSecondary: "#f5f5f5",
    textPrimary: "#333333",
    textSecondary: "#666666",
    accentColor: "#4dabf7",
    accentHover: "#3994e4",
  },
  dark: {
    backgroundPrimary: "#1a1a1a",
    backgroundSecondary: "#2d2d2d",
    textPrimary: "#ffffff",
    textSecondary: "#b3b3b3",
    accentColor: "#4dabf7", //77, 171, 247
    accentHover: "#3994e4",
  },
};

export type ThemeColors = typeof themeConfig.light;
