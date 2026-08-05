import React, { useState } from 'react';
import { View, TextInput, TextInputProps, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/theme';
import { Typography } from './Typography';

export interface InputProps extends TextInputProps {
  /** Optional label displayed above the input */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message. If provided, input switches to error state */
  error?: string;
  /** Optional icon/component to render on the left */
  leftAccessory?: React.ReactNode;
  /** Optional icon/component to render on the right */
  rightAccessory?: React.ReactNode;
}

export function Input({
  label,
  helperText,
  error,
  leftAccessory,
  rightAccessory,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const { colors, typography, layout, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const isError = Boolean(error);
  
  const getBorderColor = () => {
    if (isError) return colors.border.error;
    if (isFocused) return colors.border.focus;
    return colors.border.default;
  };

  return (
    <View style={styles.wrapper}>
      {label && (
        <Typography variant="labelLg" color="primary" style={{ marginBottom: spacing[1.5] }}>
          {label}
        </Typography>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            height: layout.inputHeight,
            borderRadius: layout.cardRadiusXs,
            borderColor: getBorderColor(),
            borderWidth: isFocused || isError ? 2 : 1,
            backgroundColor: colors.surface.card,
            paddingHorizontal: spacing[3],
            gap: spacing[2],
          },
        ]}
      >
        {leftAccessory}
        <TextInput
          style={[
            styles.input,
            typography.bodyMd,
            { color: colors.text.primary }
          ]}
          placeholderTextColor={colors.text.tertiary}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightAccessory}
      </View>

      {(error || helperText) && (
        <Typography
          variant="caption"
          color={isError ? 'error' : 'secondary'}
          style={{ marginTop: spacing[1] }}
        >
          {error || helperText}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
  },
});
