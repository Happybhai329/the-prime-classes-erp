import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const CreateTestScreen = ({ navigation }: any) => {
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];
  const queryClient = useQueryClient();

  const [testName, setTestName] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');
  const [duration, setDuration] = useState('60');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // Fetch Batches
  const { data: batchesRes } = useQuery({
    queryKey: ['batchesList'],
    queryFn: () => api.get('/batches').then((res) => res.data),
  });

  const batches = batchesRes?.data || [];

  useEffect(() => {
    if (batches.length > 0 && !selectedBatchId) {
      setSelectedBatchId(batches[0].id);
    }
  }, [batches]);

  // Create Test Mutation
  const createTestMutation = useMutation({
    mutationFn: (payload: any) => api.post('/tests', payload),
    onSuccess: () => {
      Alert.alert('Success', 'Test scheduled successfully!');
      queryClient.invalidateQueries({ queryKey: ['upcomingOnlineTests'] });
      navigation.goBack();
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create test');
    },
  });

  const handleCreateTest = () => {
    if (!testName.trim()) {
      Alert.alert('Required', 'Please enter a test paper title.');
      return;
    }

    if (!selectedBatchId) {
      Alert.alert('Required', 'Please select a batch.');
      return;
    }

    createTestMutation.mutate({
      name: testName,
      testType: 'WEEKLY', // default test type
      batchId: selectedBatchId,
      subjectIds: [], // default empty (subjects linked via batch config)
      totalMarks: Number(totalMarks),
      durationMinutes: Number(duration),
      testDate: new Date(testDate).toISOString(),
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>SCHEDULE TEST OPERATION</Text>
        </View>

        <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Input
            label="Test Paper Title"
            placeholder="e.g. Algebra Mock Assessment"
            value={testName}
            onChangeText={setTestName}
          />

          <Input
            label="Total Marks"
            keyboardType="number-pad"
            value={totalMarks}
            onChangeText={setTotalMarks}
          />

          <Input
            label="Duration (Minutes)"
            keyboardType="number-pad"
            value={duration}
            onChangeText={setDuration}
          />

          <Input
            label="Deployment Date (YYYY-MM-DD)"
            placeholder="YYYY-MM-DD"
            value={testDate}
            onChangeText={setTestDate}
          />

          {/* Batch info picker label */}
          <Text style={[styles.label, { color: colors.textMuted }]}>TARGET BATCH MODULE</Text>
          <View style={styles.selectorRow}>
            {batches.map((b: any) => {
              const isSelected = b.id === selectedBatchId;
              return (
                <TouchableOpacity
                  key={b.id}
                  onPress={() => setSelectedBatchId(b.id)}
                  style={[
                    styles.batchBadge,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceElevated,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.batchBadgeText, { color: isSelected ? colors.primaryText : colors.text }]}>
                    {b.name.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title="INITIATE TEST DEPLOYMENT"
            onPress={handleCreateTest}
            loading={createTestMutation.isPending}
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
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.1,
    marginBottom: spacing.sm,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  batchBadge: {
    borderWidth: 1.5,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  batchBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  submitBtn: {
    marginTop: spacing.md,
    width: '100%',
  },
});
