/**
 * DeTourist Theme System
 *
 * Provides a `useTheme()` hook that returns the resolved semantic color tokens
 * for the current color scheme (light or dark), plus all static tokens
 * (typography, spacing, layout, shadows, motion).
 *
 * Usage:
 *   import { useTheme } from '@/theme';
 *   const { colors, typography, spacing, layout, shadows } = useTheme();
 */

import { useMemo } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import {
  colors as allColors,
  typography,
  spacing,
  layout,
  shadows,
  duration,
  easing,
  fontFamily,
  fontWeight,
  type SemanticColors,
} from './tokens';

export type ColorScheme = 'light' | 'dark';

export interface Theme {
  /** Current color scheme. */
  colorScheme: ColorScheme;
  /** Resolved semantic colors for the active scheme. */
  colors: SemanticColors;
  /** Primitive color scales (always available, scheme-independent). */
  primitives: typeof allColors.primitives;
  /** Crowd-density spectrum colors. */
  crowd: typeof allColors.crowd;
  /** POI-category accent colors. */
  category: typeof allColors.category;
  /** Typography styles. */
  typography: typeof typography;
  /** Font family tokens. */
  fontFamily: typeof fontFamily;
  /** Font weight tokens. */
  fontWeight: typeof fontWeight;
  /** Spacing scale (multiples of 4px). */
  spacing: typeof spacing;
  /** Layout constants (radii, heights, sizes). */
  layout: typeof layout;
  /** Elevation / shadow presets. */
  shadows: typeof shadows;
  /** Animation duration presets. */
  duration: typeof duration;
  /** Animation easing presets. */
  easing: typeof easing;
}

/**
 * Returns the full resolved theme object for the current device color scheme.
 *
 * Re-renders only when the color scheme changes.
 *
 * ```tsx
 * function MyComponent() {
 *   const { colors, typography, spacing } = useTheme();
 *   return (
 *     <View style={{ padding: spacing[4], backgroundColor: colors.surface.base }}>
 *       <Text style={{ ...typography.headingLg, color: colors.text.primary }}>
 *         Hello
 *       </Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useTheme(): Theme {
  const systemScheme = useColorScheme();
  const colorScheme: ColorScheme = systemScheme === 'dark' ? 'dark' : 'light';

  return useMemo<Theme>(
    () => ({
      colorScheme,
      colors: allColors[colorScheme],
      primitives: allColors.primitives,
      crowd: allColors.crowd,
      category: allColors.category,
      typography,
      fontFamily,
      fontWeight,
      spacing,
      layout,
      shadows,
      duration,
      easing,
    }),
    [colorScheme],
  );
}

/**
 * Non-hook helper for cases outside React components (e.g., navigation theme config).
 * Returns the theme for the *current* system appearance at call time.
 */
export function getTheme(scheme?: ColorScheme): Theme {
  const resolved = scheme ?? (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');
  return {
    colorScheme: resolved,
    colors: allColors[resolved],
    primitives: allColors.primitives,
    crowd: allColors.crowd,
    category: allColors.category,
    typography,
    fontFamily,
    fontWeight,
    spacing,
    layout,
    shadows,
    duration,
    easing,
  };
}

// Re-export everything from tokens for direct access
export {
  tokens,
  typography,
  spacing,
  layout,
  shadows,
  duration,
  easing,
  fontFamily,
  fontWeight,
  colors as allColors,
  blue,
  neutral,
  green,
  amber,
  red,
  crowd,
  category,
} from './tokens';
