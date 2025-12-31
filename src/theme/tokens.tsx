import { TextStyle } from 'react-native';

const palette = {
  // Zinc Scale
  zinc950: '#09090B',
  zinc900: '#18181B',
  zinc800: '#27272A',
  zinc700: '#3F3F46',
  zinc600: '#52525B',
  zinc500: '#71717A',
  zinc400: '#A1A1AA',
  zinc300: '#D4D4D8',
  zinc200: '#E4E4E7',
  zinc100: '#F4F4F5',
  zinc50: '#FAFAFA',
  white: '#FFFFFF',

  // Accents
  emerald400: '#34D399',
  emerald500: '#10B981',
  emerald600: '#059669',

  // Semantics
  red500: '#EF4444',
  amber500: '#F59E0B',
};

export const THEME_PRESETS = {
  emerald: { primary: '#34D399', secondary: '#10B981' },
  blue: { primary: '#60A5FA', secondary: '#3B82F6' },
  purple: { primary: '#A78BFA', secondary: '#8B5CF6' },
  orange: { primary: '#F97316', secondary: '#EA580C' },
  red: { primary: '#F87171', secondary: '#EF4444' },
  pink: { primary: '#F472B6', secondary: '#EC4899' },
};

export type ThemeAccent = keyof typeof THEME_PRESETS;

export const darkColors = {
  bg: {
    primary: palette.zinc950,
    secondary: palette.zinc900,
    tertiary: palette.zinc800,
    modal: palette.zinc900,
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',
    focused: palette.zinc600,
  },
  text: {
    primary: palette.zinc50,
    secondary: palette.zinc400,
    muted: palette.zinc500,
    inverse: palette.zinc950,
  },
  accent: {
    primary: palette.emerald400,
    secondary: palette.emerald500,
  },
  semantic: {
    success: palette.emerald400,
    warning: palette.amber500,
    error: palette.red500,
  },
};

export const lightColors = {
  bg: {
    primary: palette.zinc100,
    secondary: palette.white,
    tertiary: palette.zinc200,
    modal: palette.white,
  },
  border: {
    subtle: palette.zinc300,
    focused: palette.zinc400,
  },
  text: {
    primary: palette.zinc900,
    secondary: palette.zinc600,
    muted: palette.zinc400,
    inverse: palette.zinc50,
  },
  accent: {
    primary: palette.emerald600,
    secondary: palette.emerald500,
  },
  semantic: {
    success: palette.emerald600,
    warning: palette.amber500,
    error: palette.red500,
  },
};

// Default export for backward compatibility
export const colors = darkColors;

export const spacing = {
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  8: 48,
  10: 64,
  12: 96,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

type Typography = {
  display: TextStyle;
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  body: TextStyle;
  bodySm: TextStyle;
  caption: TextStyle;
};

export const typography: Typography = {
  display: { fontSize: 36, lineHeight: 44, fontWeight: '700', letterSpacing: -0.5 },
  h1: { fontSize: 34, lineHeight: 40, fontWeight: '600', letterSpacing: -0.5 },
  h2: { fontSize: 22, lineHeight: 30, fontWeight: '600', letterSpacing: -0.3 },
  h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 26, fontWeight: '400' },
  bodySm: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  caption: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
};