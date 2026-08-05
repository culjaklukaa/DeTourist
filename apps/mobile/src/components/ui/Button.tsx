import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from '@/theme';
import { Typography } from './Typography';

export interface ButtonProps extends TouchableOpacityProps {
  /** Button semantic variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Button size */
  size?: 'default' | 'sm';
  /** Label text */
  label: string;
  /** Show loading spinner */
  loading?: boolean;
  /** Optional icon to render on the left */
  leftIcon?: React.ReactNode;
  /** Optional icon to render on the right */
  rightIcon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'default',
  label,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  ...rest
}: ButtonProps) {
  const { colors, layout, spacing, shadows } = useTheme();

  const isDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (variant === 'primary') return isDisabled ? colors.primary.disabled : colors.primary.default;
    if (variant === 'secondary') return isDisabled ? colors.secondary.disabled : colors.secondary.default;
    return 'transparent';
  };

  const getBorderColor = () => {
    if (variant === 'outline') return isDisabled ? colors.border.subtle : colors.border.default;
    return 'transparent';
  };

  const getTextColor = (): 'inverse' | 'primary' | 'secondary' | 'tertiary' => {
    if (isDisabled) return 'tertiary';
    if (variant === 'primary') return 'inverse';
    if (variant === 'secondary') return 'primary';
    return 'primary';
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isDisabled}
      style={[
        styles.base,
        {
          height: size === 'default' ? layout.buttonHeight : layout.buttonHeightSm,
          borderRadius: layout.cardRadiusXs,
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          paddingHorizontal: spacing[4],
          ...(variant === 'primary' && !isDisabled ? shadows.sm : {}),
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.text.inverse : colors.text.primary} />
      ) : (
        <View style={[styles.content, { gap: spacing[1.5] }]}>
          {leftIcon}
          <Typography
            variant={size === 'default' ? 'labelLg' : 'labelMd'}
            color={getTextColor()}
          >
            {label}
          </Typography>
          {rightIcon}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
