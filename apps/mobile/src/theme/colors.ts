export const Palette = {
  // Common Colors
  charcoalDark: '#121413',
  charcoalMedium: '#1B1F1C',
  charcoalLight: '#252B27',
  steelGray: '#3E4640',
  tacticalGreen: '#5A6E5D', // Olive drab
  brightOlive: '#8DAA90',
  desertGold: '#D4AF37', // Alert/warning
  hazardYellow: '#FFCC00',
  crimsonRed: '#8B0000', // Warning/overdue
  brightRed: '#E63946',
  white: '#FFFFFF',
  offWhite: '#F4F5F4',
  lightGray: '#E2E5E3',
  mediumGray: '#8C948F',
};

export const theme = {
  dark: {
    background: Palette.charcoalDark,
    surface: Palette.charcoalMedium,
    surfaceElevated: Palette.charcoalLight,
    border: Palette.steelGray,
    primary: Palette.tacticalGreen,
    primaryText: Palette.white,
    secondary: Palette.steelGray,
    text: Palette.offWhite,
    textMuted: Palette.mediumGray,
    accent: Palette.desertGold,
    warning: Palette.hazardYellow,
    error: Palette.brightRed,
    success: '#4CAF50',
    cardBackground: Palette.charcoalMedium,
    statusBar: 'light-content' as const,
  },
  light: {
    background: Palette.offWhite,
    surface: Palette.white,
    surfaceElevated: Palette.lightGray,
    border: Palette.lightGray,
    primary: Palette.tacticalGreen,
    primaryText: Palette.white,
    secondary: Palette.lightGray,
    text: Palette.charcoalDark,
    textMuted: Palette.steelGray,
    accent: Palette.tacticalGreen,
    warning: Palette.desertGold,
    error: Palette.crimsonRed,
    success: '#388E3C',
    cardBackground: Palette.white,
    statusBar: 'dark-content' as const,
  },
};

export type ThemeColors = typeof theme.dark;
export type ThemeMode = 'light' | 'dark';
export type Spacing = typeof spacing;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
};

export const typography = {
  fontFamily: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    huge: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
    heavy: '900' as const,
  },
};
