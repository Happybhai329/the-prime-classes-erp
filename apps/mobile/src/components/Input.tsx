import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { useAuthStore } from '../state/useAuthStore';
import { theme, spacing, borderRadius, typography } from '../theme/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const themeMode = useAuthStore((state) => state.themeMode);
  const colors = theme[themeMode];
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textMuted }]}>
          {label.toUpperCase()}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.surfaceElevated,
            borderColor: error
              ? colors.error
              : isFocused
              ? colors.accent
              : colors.border,
          },
          inputStyle,
        ]}
        placeholderTextColor={colors.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
  },
  error: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs,
  },
});
