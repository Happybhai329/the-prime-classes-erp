import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useAuthStore } from '../state/useAuthStore';
import { theme, spacing, borderRadius, typography } from '../theme/colors';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'warning' | 'error';
  style?: ViewStyle;
  headerStyle?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  variant = 'default',
  style,
  headerStyle,
}) => {
  const themeMode = useAuthStore((state) => state.themeMode);
  const colors = theme[themeMode];

  const getBorderColor = () => {
    switch (variant) {
      case 'accent':
        return colors.accent;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'default':
      default:
        return colors.border;
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: getBorderColor(),
        },
        style,
      ]}
    >
      {(title || subtitle) && (
        <View style={[styles.header, { borderBottomColor: colors.border }, headerStyle]}>
          {title && (
            <Text style={[styles.title, { color: colors.text }]}>
              {title.toUpperCase()}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      <View style={styles.body}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
  body: {
    padding: spacing.md,
  },
});
