import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../../state/useAuthStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { theme, spacing, typography } from '../../theme/colors';

export const LoginScreen = ({ navigation }: any) => {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  const [identifier, setIdentifier] = useState(''); // Email or Phone
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!identifier) {
      tempErrors.identifier = 'Email or Phone Number is required';
    }
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await login(identifier.trim(), password);
    } catch (err: any) {
      Alert.alert('Authentication Failed', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <View style={styles.badgeHex}>
            <Text style={styles.badgeText}>TPC</Text>
          </View>
          <Text style={styles.title}>THE PRIME CLASSES</Text>
          <Text style={styles.subtitle}>TACTICAL OPERATIONS CONTROL PANEL</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Creds / Identifier"
            placeholder="Enter Email or Phone Number"
            value={identifier}
            onChangeText={setIdentifier}
            error={errors.identifier}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Input
            label="Access Key / Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            title="AUTHENTICATE SYSTEM"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginBtn}
          />

          <View style={styles.footerRow}>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>FORGOT AUTH PASSWORD?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121413', // Tactical dark theme background
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  badgeHex: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#D4AF37', // Desert Gold
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B1F1C',
    marginBottom: spacing.md,
  },
  badgeText: {
    color: '#D4AF37',
    fontWeight: '900',
    fontSize: 22,
    letterSpacing: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  subtitle: {
    color: '#5A6E5D', // Olive Green
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginTop: spacing.xs,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#1B1F1C',
    borderWidth: 1.5,
    borderColor: '#3E4640',
    borderRadius: 12,
    padding: spacing.lg,
    width: '100%',
  },
  loginBtn: {
    marginTop: spacing.sm,
  },
  footerRow: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  forgotText: {
    color: '#8C948F',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.1,
  },
});
