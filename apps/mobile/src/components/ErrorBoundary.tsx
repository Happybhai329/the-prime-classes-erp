import React, { ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Button } from './Button';
import { theme, spacing, typography } from '../theme/colors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Mobile App Crash Detected:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default visual fallback
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.alertHex}>
              <Text style={styles.alertIcon}>⚠️</Text>
            </View>
            <Text style={styles.title}>SYSTEM FAILURE</Text>
            <Text style={styles.subtitle}>
              An unexpected application error has been intercepted.
            </Text>
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {this.state.error?.name}: {this.state.error?.message}
              </Text>
            </View>
            <Button
              title="REBOOT INTERFACE"
              variant="primary"
              onPress={this.handleReset}
              style={styles.button}
            />
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121413', // Hardcoded dark background for crashes
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  alertHex: {
    width: 64,
    height: 64,
    backgroundColor: '#8B0000',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  alertIcon: {
    fontSize: 32,
  },
  title: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: '#8C948F',
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 18,
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#1B1F1C',
    borderWidth: 1.5,
    borderColor: '#3E4640',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xl,
  },
  errorText: {
    color: '#E63946',
    fontFamily: 'Courier',
    fontSize: typography.sizes.xs,
  },
  button: {
    width: '80%',
  },
});
