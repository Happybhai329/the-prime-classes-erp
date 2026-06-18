import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { Card } from '../../components/Card';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const FeeMonitoringScreen = () => {
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];

  // Fetch Fee Dashboard Analytics
  const { data: feeStats, isLoading } = useQuery({
    queryKey: ['adminFeeDashboard'],
    queryFn: () => api.get('/fees/dashboard').then((res) => res.data),
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
          <Text style={[styles.title, { color: colors.text }]}>REVENUE CONTROLLER</Text>
        </View>

        {/* Primary Metrics */}
        <Card title="COLLECTION STRENGTHS" variant="accent">
          <View style={styles.mainMetricsRow}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLbl, { color: colors.textMuted }]}>COLLECTION RATE</Text>
              <Text style={[styles.metricVal, { color: colors.accent }]}>
                {feeStats?.collectionRate != null ? `${Math.round(feeStats.collectionRate)}%` : '0%'}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLbl, { color: colors.textMuted }]}>FULLY PAID CADETS</Text>
              <Text style={[styles.metricVal, { color: colors.success }]}>
                {feeStats?.studentsFullyPaid ?? 0} / {feeStats?.totalStudentsWithFees ?? 0}
              </Text>
            </View>
          </View>
        </Card>

        {/* Cashflows */}
        <Card title="REVENUE IN-FLOWS">
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>REVENUE (THIS MONTH)</Text>
            <Text style={[styles.val, { color: colors.text }]}>₹{feeStats?.revenueThisMonth ?? 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>REVENUE (THIS YEAR)</Text>
            <Text style={[styles.val, { color: colors.text }]}>₹{feeStats?.revenueThisYear ?? 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>TOTAL REFUNDS PAID</Text>
            <Text style={[styles.val, { color: colors.error }]}>₹{feeStats?.refundAmount ?? 0}</Text>
          </View>
        </Card>

        {/* Liabilities */}
        <Card title="OUTSTANDING RECEIVABLES STATEMENT" variant="error">
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>TOTAL OUTSTANDING DUES</Text>
            <Text style={[styles.val, { color: colors.error }]}>₹{feeStats?.pendingFees ?? 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>CRITICAL OVERDUE AMOUNT</Text>
            <Text style={[styles.val, { color: colors.error, fontWeight: '900' }]}>₹{feeStats?.overdueAmount ?? 0}</Text>
          </View>
        </Card>
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
  mainMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.xs,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLbl: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
  },
  metricVal: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
    marginTop: 4,
  },
  row: {
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
  val: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
