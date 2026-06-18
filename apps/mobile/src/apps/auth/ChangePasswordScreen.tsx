import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Alert, ScrollView } from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const ChangePasswordScreen = ({ navigation }: any) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Required Fields', 'Please fill in all the password fields.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Invalid Password', 'New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Confirm password does not match new password.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setIsLoading(false);
      Alert.alert('Success', 'Password changed successfully. Please log in again.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.response?.data?.message || 'Error occurred';
      Alert.alert('Change Failed', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>CHANGE SECURITY PASSCODE</Text>
        <Text style={styles.instructions}>
          RESETTING YOUR PASSCODE WILL FORCE-INVALIDATE ALL EXISTING SESSIONS ACROSS OTHER TERMINALS AND DEVICES FOR SECURITY COMPLIANCE.
        </Text>

        <View style={styles.form}>
          <Input
            label="Current Passcode"
            placeholder="••••••••"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Input
            label="New Passcode (Min 8 Chars)"
            placeholder="••••••••"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Input
            label="Confirm New Passcode"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            title="COMMIT PASSCODE CHANGE"
            onPress={handleChangePassword}
            loading={isLoading}
            style={styles.commitBtn}
          />

          <Button
            title="CANCEL"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.cancelBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121413',
  },
  content: {
    flexGrow: 1,
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
  commitBtn: {
    marginTop: spacing.sm,
  },
  cancelBtn: {
    marginTop: spacing.md,
  },
});
