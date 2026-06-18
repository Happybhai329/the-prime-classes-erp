import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { Card } from '../../components/Card';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const ChildProgressScreen = ({ route }: any) => {
  const { studentId } = route.params;
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['childAnalytics', studentId],
    queryFn: () => api.get(`/dashboard/parent/child/${studentId}/analytics`).then((res) => res.data),
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>PERFORMANCE ANALYSIS</Text>
          <Text style={[styles.subText, { color: colors.textMuted }]}>
            TARGET OBJECT: {analytics?.student?.name.toUpperCase()}
          </Text>
        </View>

        {/* Attendance Analytics */}
        <Card title="ATTENDANCE LOG METRICS">
          <View style={styles.metricRow}>
            <Text style={[styles.label, { color: colors.textMuted }]}>ATTENDANCE RATE</Text>
            <Text style={[styles.value, { color: colors.text }]}>{analytics?.attendance?.percentage}%</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={[styles.label, { color: colors.textMuted }]}>TOTAL SESSIONS REPORTED</Text>
            <Text style={[styles.value, { color: colors.text }]}>{analytics?.attendance?.totalDays} DAYS</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={[styles.label, { color: colors.textMuted }]}>TOTAL SESSIONS ATTENDED</Text>
            <Text style={[styles.value, { color: colors.success }]}>{analytics?.attendance?.present} DAYS</Text>
          </View>
        </Card>

        {/* Test Performance Analytics */}
        <Card title="TEST EXAMINATION DATA">
          <View style={styles.metricRow}>
            <Text style={[styles.label, { color: colors.textMuted }]}>TESTS ATTEMPTED</Text>
            <Text style={[styles.value, { color: colors.text }]}>{analytics?.tests?.totalTests} PAPERS</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={[styles.label, { color: colors.textMuted }]}>AVERAGE PERCENTILE SCORE</Text>
            <Text style={[styles.value, { color: colors.accent }]}>{analytics?.tests?.averagePercentage}%</Text>
          </View>
        </Card>

        {/* Tactical Recommendation Badge */}
        <View style={[styles.badge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Text style={[styles.badgeTitle, { color: colors.accent }]}>TACTICAL RECOMMENDATION</Text>
          <Text style={[styles.badgeBody, { color: colors.text }]}>
            {analytics?.attendance?.percentage < 75
              ? 'ALERT: Attendance is below 75%. Urgent intervention required to catch up with class schedules.'
              : analytics?.tests?.averagePercentage < 60
              ? 'ATTENTION: Performance scores are low. Suggest booking additional study tutorials for weaker subject fields.'
              : 'CONTINUE OPERATIONS: Cadet maintains satisfactory academic progress. Maintain current training schedule.'}
          </Text>
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
  subText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginTop: 2,
    letterSpacing: 1,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3E4640',
  },
  label: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
  },
  value: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  badge: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  badgeTitle: {
    fontWeight: typography.weights.heavy,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  badgeBody: {
    fontSize: typography.sizes.xs,
    lineHeight: 16,
  },
});
