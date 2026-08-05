import React from 'react';
import { View, ViewProps, Pressable, PressableProps, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

export interface CardProps extends ViewProps {
  /** Visual variant of the card */
  variant?: 'elevated' | 'outline' | 'flat';
  /** Optional onPress to make the card interactive */
  onPress?: PressableProps['onPress'];
  /** Remove default padding */
  noPadding?: boolean;
}

export function Card({
  variant = 'elevated',
  onPress,
  noPadding = false,
  style,
  children,
  ...rest
}: CardProps) {
  const { colors, layout, shadows } = useTheme();

  const baseStyle = {
    backgroundColor: colors.surface.card,
    borderRadius: layout.cardRadius,
    padding: noPadding ? 0 : layout.cardPadding,
    borderColor: variant === 'outline' ? colors.border.default : 'transparent',
    borderWidth: variant === 'outline' ? 1 : 0,
    ...(variant === 'elevated' ? shadows.sm : {}),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          baseStyle,
          pressed && { opacity: 0.9, backgroundColor: colors.surface.base },
          style,
        ]}
        {...(rest as any)}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[baseStyle, style]} {...rest}>
      {children}
    </View>
  );
}
