import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Alert } from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState('');

  const handleRequestOtp = async () => {
    if (!identifier) {
      Alert.alert('Required', 'Please enter your email or phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', {
        email: identifier.trim(),
      });
      setIsLoading(false);
      setOtpSent(true);
      // Retrieve token if backend returns it in dev mode
      if (response.data?.token) {
        setReceivedOtp(response.data.token);
      }
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.response?.data?.message || 'Error occurred';
      Alert.alert('Request Failed', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>FORGOT ACCESS KEY</Text>
        <Text style={styles.instructions}>
          {!otpSent
            ? 'PROVIDE YOUR REGISTERED EMAIL OR PHONE NUMBER TO RECEIVE A SECURE RESET CODE FROM THE ERP COMMAND CENTER.'
            : 'SECURE OTP RESET CODE GENERATED SUCCESSFULLY.'}
        </Text>

        {!otpSent ? (
          <View style={styles.form}>
            <Input
              label="Identifier"
              placeholder="Enter Email or Phone"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
            />
            <Button
              title="REQUEST PASSWORD RESET"
              onPress={handleRequestOtp}
              loading={isLoading}
            />
            <Button
              title="BACK TO LOGIN"
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            />
          </View>
        ) : (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>DISPATCHED RESET CODE</Text>
            {receivedOtp ? (
              <View style={styles.otpBox}>
                <Text style={styles.otpLabel}>TEMPORARY AUTH OTP</Text>
                <Text style={styles.otpValue}>{receivedOtp}</Text>
              </View>
            ) : (
              <Text style={styles.successSub}>CHECK YOUR INBOX / SMS FOR YOUR 6-DIGIT CODE.</Text>
            )}
            <Text style={styles.info}>
              Use the temporary code or contact your administrator to reset your credentials.
            </Text>
            <Button
              title="RETURN TO SIGN IN"
              onPress={() => navigation.navigate('Login')}
              style={styles.backBtn}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121413',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
    letterSpacing: 2,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  instructions: {
    color: '#8C948F',
    fontSize: typography.sizes.xs,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  form: {
    backgroundColor: '#1B1F1C',
    borderWidth: 1.5,
    borderColor: '#3E4640',
    borderRadius: 12,
    padding: spacing.lg,
  },
  backBtn: {
    marginTop: spacing.md,
  },
  successContainer: {
    backgroundColor: '#1B1F1C',
    borderWidth: 1.5,
    borderColor: '#D4AF37', // Yellow alert border
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
  },
  successTitle: {
    color: '#D4AF37',
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.md,
    letterSpacing: 1.2,
    marginBottom: spacing.md,
  },
  successSub: {
    color: '#FFFFFF',
    fontWeight: typography.weights.medium,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  otpBox: {
    backgroundColor: '#121413',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3E4640',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  otpLabel: {
    color: '#8C948F',
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  otpValue: {
    color: '#FFCC00',
    fontSize: typography.sizes.huge,
    fontWeight: typography.weights.heavy,
    letterSpacing: 4,
  },
  info: {
    color: '#8C948F',
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: spacing.lg,
  },
});
