/**
 * DeTourist Design Tokens
 *
 * Single source of truth for all visual constants.
 * Derived from the DeTourist brand identity (blue chevron on ice-blue).
 *
 * @see docs/design_tokens.md for rationale and usage guidelines.
 */

// ─────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

/**
 * Type ramp built on a 1.250 Major Third modular scale, anchored at 16px body.
 * Each entry provides fontSize, lineHeight, fontWeight, letterSpacing, and fontFamily
 * — ready to spread directly into a StyleSheet definition.
 */
export const typography = {
  displayLg: {
    fontFamily: fontFamily.bold,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  displayMd: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },
  displaySm: {
    fontFamily: fontFamily.semiBold,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: fontWeight.semiBold,
    letterSpacing: -0.2,
  },
  headingLg: {
    fontFamily: fontFamily.semiBold,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: fontWeight.semiBold,
    letterSpacing: 0,
  },
  headingMd: {
    fontFamily: fontFamily.medium,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: fontWeight.medium,
    letterSpacing: 0,
  },
  headingSm: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: fontWeight.semiBold,
    letterSpacing: 0.1,
  },
  bodyLg: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeight.regular,
    letterSpacing: 0,
  },
  bodyMd: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeight.regular,
    letterSpacing: 0.1,
  },
  bodySm: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: fontWeight.regular,
    letterSpacing: 0.2,
  },
  labelLg: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.3,
  },
  labelMd: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.4,
  },
  labelSm: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.5,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: fontWeight.regular,
    letterSpacing: 0.3,
  },
} as const;

export type TypographyToken = keyof typeof typography;

// ─────────────────────────────────────────────
// Colors — Primitives
// ─────────────────────────────────────────────

/** Brand primary scale — extracted from the app icon gradient range. */
export const blue = {
  50: '#E6F4FE',
  100: '#C0E2FC',
  200: '#8CC9F9',
  300: '#58B0F5',
  400: '#2E9AF0',
  500: '#1A85E0',
  600: '#1470C4',
  700: '#0F5AA3',
  800: '#0A4483',
  900: '#062F63',
} as const;

/** Warm-tinted neutrals (slight blue undertone). */
export const neutral = {
  0: '#FFFFFF',
  50: '#F6F8FA',
  100: '#EEF1F5',
  150: '#E2E7EE',
  200: '#D1D8E1',
  300: '#B0BBC8',
  400: '#8B99A8',
  500: '#6B7A8D',
  600: '#516173',
  700: '#3A4A5C',
  800: '#263545',
  900: '#141E29',
  950: '#0C1318',
} as const;

/** Semantic greens. */
export const green = {
  50: '#E8F8EE',
  500: '#22A855',
  700: '#166E38',
} as const;

/** Semantic yellows / ambers. */
export const amber = {
  50: '#FFF7E6',
  500: '#F5A623',
  700: '#A36B0D',
} as const;

/** Semantic reds. */
export const red = {
  50: '#FDE8E8',
  500: '#E53E3E',
  700: '#9B2C2C',
} as const;

/** Crowd-density spectrum (traffic-light metaphor for CrowdIndex 0.0–1.0). */
export const crowd = {
  empty: '#22A855',   // 0.0–0.2  Quiet
  low: '#6BC96E',     // 0.2–0.4  Calm
  moderate: '#F5A623', // 0.4–0.6  Moderate
  busy: '#F06D30',    // 0.6–0.8  Busy
  packed: '#E53E3E',  // 0.8–1.0  Packed
} as const;

/** Per-category accent colors — map pins, chips, feed cards. */
export const category = {
  attractions: '#8B5CF6',
  landmarks: '#D97706',
  food: '#EA580C',
  shopping: '#DB2777',
  parks: '#16A34A',
  transit: '#6B7A8D',
  accommodation: '#1A85E0',
} as const;

// ─────────────────────────────────────────────
// Colors — Semantic (Light & Dark themes)
// ─────────────────────────────────────────────

const lightColors = {
  // Surfaces
  surface: {
    base: neutral[50],
    card: neutral[0],
    elevated: neutral[0],
    overlay: 'rgba(0,0,0,0.5)',
    brand: blue[50],
  },

  // Text
  text: {
    primary: neutral[800],
    secondary: neutral[600],
    tertiary: neutral[500],
    inverse: neutral[0],
    link: blue[500],
    error: red[700],
    success: green[700],
    warning: amber[700],
  },

  // Icons
  icon: {
    active: blue[500],
    inactive: neutral[400],
    inverse: neutral[0],
  },

  // Borders
  border: {
    default: neutral[150],
    subtle: neutral[100],
    focus: blue[500],
    error: red[500],
  },

  // Interactive — primary
  primary: {
    default: blue[500],
    pressed: blue[600],
    disabled: blue[200],
    text: neutral[0],
  },

  // Interactive — secondary
  secondary: {
    default: neutral[100],
    pressed: neutral[200],
    disabled: neutral[100],
    text: neutral[700],
  },

  // Feedback
  success: {
    bg: green[50],
    default: green[500],
    text: green[700],
  },
  warning: {
    bg: amber[50],
    default: amber[500],
    text: amber[700],
  },
  error: {
    bg: red[50],
    default: red[500],
    text: red[700],
  },
  info: {
    bg: blue[50],
    default: blue[500],
    text: blue[700],
  },
};

const darkColors = {
  // Surfaces
  surface: {
    base: neutral[950],
    card: neutral[900],
    elevated: '#1A2433',
    overlay: 'rgba(0,0,0,0.7)',
    brand: blue[900],
  },

  // Text
  text: {
    primary: neutral[100],
    secondary: neutral[400],
    tertiary: neutral[500],
    inverse: neutral[950],
    link: blue[400],
    error: red[500],
    success: green[500],
    warning: amber[500],
  },

  // Icons
  icon: {
    active: blue[400],
    inactive: neutral[500],
    inverse: neutral[950],
  },

  // Borders
  border: {
    default: neutral[800],
    subtle: neutral[900],
    focus: blue[400],
    error: red[500],
  },

  // Interactive — primary
  primary: {
    default: blue[500],
    pressed: blue[400],
    disabled: blue[800],
    text: neutral[0],
  },

  // Interactive — secondary
  secondary: {
    default: neutral[800],
    pressed: neutral[700],
    disabled: neutral[900],
    text: neutral[200],
  },

  // Feedback
  success: {
    bg: '#0E3A1F',
    default: '#4ADE80',
    text: green[500],
  },
  warning: {
    bg: '#3D2E0A',
    default: '#FBBF24',
    text: amber[500],
  },
  error: {
    bg: '#3D0E0E',
    default: '#F87171',
    text: red[500],
  },
  info: {
    bg: '#0A2540',
    default: blue[300],
    text: blue[400],
  },
};

type DeepString<T> = {
  [P in keyof T]: T[P] extends object ? DeepString<T[P]> : string;
};

export type SemanticColors = DeepString<typeof lightColors>;

export const colors = {
  light: lightColors,
  dark: darkColors,
  primitives: { blue, neutral, green, amber, red },
  crowd,
  category,
} as const;

// ─────────────────────────────────────────────
// Spacing
// ─────────────────────────────────────────────

/** 4px base-unit spacing scale. Access by multiplier: spacing[4] = 16. */
export const spacing = {
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

// ─────────────────────────────────────────────
// Layout Constants
// ─────────────────────────────────────────────

export const layout = {
  screenPaddingX: spacing[5],   // 20
  screenPaddingTop: spacing[12], // 48
  cardPadding: spacing[4],      // 16

  cardRadius: 16,
  cardRadiusSm: 12,
  cardRadiusXs: 8,

  buttonHeight: 52,
  buttonHeightSm: 40,
  inputHeight: 52,
  tabBarHeight: 64,

  iconSizeSm: 16,
  iconSizeMd: 24,
  iconSizeLg: 32,

  avatarSm: 32,
  avatarMd: 44,
  avatarLg: 64,

  listItemMinHeight: 56,
} as const;

// ─────────────────────────────────────────────
// Elevation / Shadows
// ─────────────────────────────────────────────

import { Platform } from 'react-native';

type ShadowStyle = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

const makeShadow = (
  offsetY: number,
  radius: number,
  opacity: number,
  elevation: number,
): ShadowStyle => ({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: Platform.OS === 'ios' ? opacity : 0,
  shadowRadius: Platform.OS === 'ios' ? radius : 0,
  elevation: Platform.OS === 'android' ? elevation : 0,
});

export const shadows = {
  none: makeShadow(0, 0, 0, 0),
  sm: makeShadow(1, 3, 0.08, 2),
  md: makeShadow(2, 8, 0.12, 4),
  lg: makeShadow(4, 16, 0.16, 8),
  xl: makeShadow(8, 24, 0.20, 12),
} as const;

// ─────────────────────────────────────────────
// Motion / Timing
// ─────────────────────────────────────────────

export const duration = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

export const easing = {
  default: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1.0 },
  decelerate: { x1: 0.0, y1: 0.0, x2: 0.2, y2: 1.0 },
  accelerate: { x1: 0.4, y1: 0.0, x2: 1.0, y2: 1.0 },
} as const;

// ─────────────────────────────────────────────
// Aggregate export
// ─────────────────────────────────────────────

export const tokens = {
  fontFamily,
  fontWeight,
  typography,
  colors,
  spacing,
  layout,
  shadows,
  duration,
  easing,
} as const;

export default tokens;
