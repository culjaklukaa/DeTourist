import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import type { TypographyToken } from '@/theme/tokens';

export interface TypographyProps extends TextProps {
  /** The typography scale variant */
  variant?: TypographyToken;
  /** Semantic color override. Defaults to text.primary */
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'error' | 'success' | 'warning' | 'link';
  /** Text alignment */
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

/**
 * Standardized Text component mapping to the design token scale.
 */
export function Typography({
  variant = 'bodyLg',
  color = 'primary',
  align = 'auto',
  style,
  children,
  ...rest
}: TypographyProps) {
  const { typography, colors } = useTheme();

  return (
    <Text
      style={[
        typography[variant],
        {
          color: colors.text[color],
          textAlign: align,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
