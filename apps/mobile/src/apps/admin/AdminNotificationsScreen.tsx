import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const AdminNotificationsScreen = ({ navigation }: any) => {
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Send Notification Mutation
  const sendMutation = useMutation({
    mutationFn: (payload: any) => api.post('/notifications', payload),
    onSuccess: () => {
      Alert.alert('Success', 'Broadcast push notification sent successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      setTitle('');
      setBody('');
      setSelectedRoles([]);
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to dispatch notification.');
    },
  });

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSend = () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Required', 'Please enter a title and description.');
      return;
    }

    if (selectedRoles.length === 0) {
      Alert.alert('Required', 'Please select at least one target role.');
      return;
    }

    sendMutation.mutate({
      title,
      body,
      type: 'ANNOUNCEMENT',
      targetRoles: selectedRoles,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>DISPATCH ALERTS</Text>
        </View>

        <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Input
            label="Alert Title"
            placeholder="e.g. Critical Fee Reminder or RIMC Test Results"
            value={title}
            onChangeText={setTitle}
          />

          <Input
            label="Message Body"
            placeholder="Draft the alert notification message contents..."
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={4}
            inputStyle={styles.bodyInput}
          />

          {/* Role Checkboxes */}
          <Text style={[styles.label, { color: colors.textMuted }]}>TARGET AUDIENCE REGISTRIES</Text>
          <View style={styles.roleContainer}>
            {['STUDENT', 'PARENT', 'FACULTY'].map((role) => {
              const isSelected = selectedRoles.includes(role);
              return (
                <TouchableOpacity
                  key={role}
                  onPress={() => toggleRole(role)}
                  style={[
                    styles.checkboxRow,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceElevated,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.checkbox, { borderColor: isSelected ? colors.accent : colors.border }]}>
                    {isSelected && <View style={[styles.checkboxChecked, { backgroundColor: colors.accent }]} />}
                  </View>
                  <Text style={[styles.roleText, { color: isSelected ? colors.primaryText : colors.text }]}>
                    {role} TARGETS
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title="DISPATCH BROADCAST ALERTS"
            onPress={handleSend}
            loading={sendMutation.isPending}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.5,
  },
  form: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: spacing.md,
  },
  bodyInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  roleContainer: {
    marginBottom: spacing.lg,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  roleText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
  },
  submitBtn: {
    marginTop: spacing.md,
    width: '100%',
  },
});
