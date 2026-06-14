import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { Card } from '../../components/Card';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const ResultsScreen = () => {
  const { user, themeMode } = useAuthStore();
  const colors = theme[themeMode];
  const studentId = user?.student?.id;

  const { data: testReport, isLoading } = useQuery({
    queryKey: ['studentTestReport', studentId],
    queryFn: () => api.get(`/students/${studentId}/test-summary`).then((res) => res.data),
    enabled: !!studentId,
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>ACADEMIC RESULTS</Text>
        </View>

        {/* Overview Stats */}
        <View style={styles.overviewGrid}>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.text }]}>
              {testReport?.tests?.totalTests ?? 0}
            </Text>
            <Text style={[styles.statLbl, { color: colors.textMuted }]}>TOTAL TESTS</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.accent }]}>
              {testReport?.tests?.averagePercentage != null ? `${Math.round(testReport.tests.averagePercentage)}%` : '0%'}
            </Text>
            <Text style={[styles.statLbl, { color: colors.textMuted }]}>AVERAGE RATE</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.success }]}>
              #{testReport?.tests?.bestRank ?? 'N/A'}
            </Text>
            <Text style={[styles.statLbl, { color: colors.textMuted }]}>BEST BATCH RANK</Text>
          </View>
        </View>

        {/* Subject Strengths & Weaknesses */}
        <Card title="TACTICAL SUBJECT EVALUATION">
          <Text style={[styles.subSectionTitle, { color: colors.text }]}>STRENGTH FIELDS</Text>
          {testReport?.tests?.subjectStrengths?.length > 0 ? (
            testReport.tests.subjectStrengths.map((sub: any, idx: number) => (
              <View key={idx} style={styles.subRow}>
                <Text style={[styles.subName, { color: colors.text }]}>🟢 {sub.subject.toUpperCase()}</Text>
                <Text style={[styles.subVal, { color: colors.success }]}>{Math.round(sub.avgPercentage)}%</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>NO STRENGTH METRICS GENERATED YET.</Text>
          )}

          <Text style={[styles.subSectionTitle, { color: colors.text, marginTop: spacing.md }]}>DEVELOPMENT FIELDS</Text>
          {testReport?.tests?.weakAreas?.length > 0 ? (
            testReport.tests.weakAreas.map((sub: any, idx: number) => (
              <View key={idx} style={styles.subRow}>
                <Text style={[styles.subName, { color: colors.text }]}>🔴 {sub.subject.toUpperCase()}</Text>
                <Text style={[styles.subVal, { color: colors.error }]}>{Math.round(sub.avgPercentage)}%</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>NO CRITICAL WEAKNESS AREAS LOGGED.</Text>
          )}
        </Card>

        {/* Recent Score sheets */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>RECENT ASSESSMENTS</Text>
        {testReport?.tests?.recentTests?.length > 0 ? (
          testReport.tests.recentTests.map((test: any, idx: number) => (
            <View key={idx} style={[styles.testCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.testCardHeader}>
                <Text style={[styles.testName, { color: colors.text }]}>{test.testName.toUpperCase()}</Text>
                <Text style={[styles.testDate, { color: colors.textMuted }]}>{new Date(test.testDate).toLocaleDateString()}</Text>
              </View>
              <View style={styles.testCardBody}>
                <View style={styles.scoreCol}>
                  <Text style={[styles.valText, { color: colors.text }]}>
                    {test.marksObtained} / {test.totalMarks}
                  </Text>
                  <Text style={[styles.lblText, { color: colors.textMuted }]}>SCORE</Text>
                </View>
                <View style={styles.scoreCol}>
                  <Text style={[styles.valText, { color: colors.accent }]}>
                    {Math.round(test.percentage)}%
                  </Text>
                  <Text style={[styles.lblText, { color: colors.textMuted }]}>PERCENTAGE</Text>
                </View>
                <View style={styles.scoreCol}>
                  <Text style={[styles.valText, { color: colors.success }]}>
                    #{test.batchRank ?? 'N/A'}
                  </Text>
                  <Text style={[styles.lblText, { color: colors.textMuted }]}>BATCH RANK</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.textMuted, marginTop: spacing.md }]}>NO TESTS ASSESSED YET.</Text>
        )}
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
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 0.31,
    padding: spacing.sm,
    borderWidth: 1.5,
    borderRadius: 6,
    alignItems: 'center',
  },
  statNum: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
  },
  statLbl: {
    fontSize: 8,
    fontWeight: typography.weights.bold,
    marginTop: 2,
    letterSpacing: 0.8,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  subSectionTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#3E4640',
    paddingBottom: 4,
    marginBottom: spacing.xs,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  subName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  subVal: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  testCard: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  testCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3E4640',
    paddingBottom: spacing.xs,
    marginBottom: spacing.sm,
  },
  testName: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  testDate: {
    fontSize: 9,
  },
  testCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreCol: {
    alignItems: 'center',
  },
  valText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  lblText: {
    fontSize: 8,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
