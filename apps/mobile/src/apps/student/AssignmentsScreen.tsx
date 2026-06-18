import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const AssignmentsScreen = () => {
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];
  const queryClient = useQueryClient();

  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // 1. Fetch Assignments
  const { data: assignmentsRes, isLoading } = useQuery({
    queryKey: ['assignmentsList'],
    queryFn: () => api.get('/assignments').then((res) => res.data),
  });

  // 2. Submit Assignment (Simulation of document upload)
  const submitMutation = useMutation({
    mutationFn: ({ id, fileData }: { id: string; fileData: any }) => {
      const formData = new FormData();
      formData.append('file', fileData);
      return api.post(`/assignments/${id}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      Alert.alert('Success', 'Homework submission uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['assignmentsList'] });
      setUploadingId(null);
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to upload homework');
      setUploadingId(null);
    },
  });

  const handlePickAndSubmit = (assignmentId: string) => {
    // In production React Native, we use expo-document-picker.
    // For this implementation, we simulate picking a completed PDF file and submitting it:
    const mockFile = {
      uri: 'file:///simulated/path/homework.pdf',
      name: 'homework.pdf',
      type: 'application/pdf',
    };
    
    setUploadingId(assignmentId);
    submitMutation.mutate({ id: assignmentId, fileData: mockFile as any });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GRADED':
        return colors.success;
      case 'SUBMITTED':
        return colors.accent;
      case 'PENDING':
      default:
        return colors.error;
    }
  };

  const assignments = assignmentsRes || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>ASSIGNMENTS TASK LIST</Text>
      </View>

      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              NO ASSIGNMENT TASKS ASSIGNED TO YOUR BATCH.
            </Text>
          ) : null
        }
        renderItem={({ item }: any) => {
          const submission = item.submissions?.[0]; // Get student's submission
          const status = submission
            ? submission.grade != null
              ? 'GRADED'
              : 'SUBMITTED'
            : 'PENDING';

          return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.titleCol}>
                  <Text style={[styles.assTitle, { color: colors.text }]}>
                    {item.title.toUpperCase()}
                  </Text>
                  <Text style={[styles.assSub, { color: colors.textMuted }]}>
                    SUBJECT: {item.subject?.name} | DUE: {new Date(item.dueDate).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[styles.statusBadge, { color: getStatusColor(status), borderColor: getStatusColor(status) }]}>
                  {status}
                </Text>
              </View>

              <Text style={[styles.instructions, { color: colors.text }]}>
                {item.instructions || 'No detailed instructions available.'}
              </Text>

              {status === 'GRADED' && (
                <View style={[styles.feedbackBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                  <Text style={[styles.feedbackTitle, { color: colors.success }]}>EVALUATION SCORECARD</Text>
                  <Text style={[styles.scoreText, { color: colors.text }]}>
                    MARKS: {submission.grade} / {item.maxScore ?? 100}
                  </Text>
                  {submission.feedback && (
                    <Text style={[styles.feedbackText, { color: colors.textMuted }]}>
                      FACULTY FEEDBACK: "{submission.feedback}"
                    </Text>
                  )}
                </View>
              )}

              {status === 'PENDING' && (
                <Button
                  title={uploadingId === item.id ? 'TRANSMITTING FILE...' : 'SUBMIT WORK (PDF)'}
                  onPress={() => handlePickAndSubmit(item.id)}
                  loading={uploadingId === item.id}
                  variant="primary"
                  style={styles.submitBtn}
                />
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.5,
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3E4640',
    paddingBottom: spacing.xs,
    marginBottom: spacing.sm,
  },
  titleCol: {
    flex: 0.75,
  },
  assTitle: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  assSub: {
    fontSize: 9,
    marginTop: 2,
  },
  statusBadge: {
    fontSize: 8,
    fontWeight: typography.weights.bold,
    borderWidth: 1,
    paddingVertical: 1,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    overflow: 'hidden',
    textAlign: 'center',
  },
  instructions: {
    fontSize: typography.sizes.xs,
    lineHeight: 16,
    marginBottom: spacing.md,
  },
  submitBtn: {
    width: '100%',
  },
  feedbackBox: {
    borderWidth: 1,
    borderRadius: 6,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  feedbackTitle: {
    fontSize: 9,
    fontWeight: typography.weights.heavy,
    letterSpacing: 1,
    marginBottom: 4,
  },
  scoreText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  feedbackText: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
