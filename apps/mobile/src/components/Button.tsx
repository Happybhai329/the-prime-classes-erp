import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useAuthStore } from '../state/useAuthStore';
import { theme, spacing, borderRadius, typography } from '../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const themeMode = useAuthStore((state) => state.themeMode);
  const colors = theme[themeMode];

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.border,
        };
      case 'accent':
        return {
          backgroundColor: colors.accent,
        };
      case 'danger':
        return {
          backgroundColor: colors.error,
        };
      case 'primary':
      default:
        return {
          backgroundColor: colors.primary,
        };
    }
  };

  const getVariantTextStyles = (): TextStyle => {
    switch (variant) {
      case 'secondary':
        return {
          color: colors.text,
        };
      case 'accent':
        return {
          color: colors.background, // Contrast on desert gold/yellow
        };
      default:
        return {
          color: colors.primaryText,
        };
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm };
      case 'lg':
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.xl };
      case 'md':
      default:
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
    }
  };

  const getTextSizeStyles = (): TextStyle => {
    switch (size) {
      case 'sm':
        return { fontSize: typography.sizes.xs };
      case 'lg':
        return { fontSize: typography.sizes.lg };
      case 'md':
      default:
        return { fontSize: typography.sizes.md };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.text : colors.primaryText} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            getVariantTextStyles(),
            getTextSizeStyles(),
            textStyle,
          ]}
        >
          {title.toUpperCase()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
});
