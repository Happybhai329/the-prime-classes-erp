import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const ReportsScreen = () => {
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];

  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // 1. Fetch Batches
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

  // 2. Fetch Batch Attendance Report
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['batchReport', selectedBatchId],
    queryFn: () => api.get(`/attendance/reports/batch/${selectedBatchId}`).then((res) => res.data),
    enabled: !!selectedBatchId,
  });

  const studentReports = reportData?.students || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>BATCH PERFORMANCE REPORTS</Text>
      </View>

      {/* Batch selector horizontal list */}
      <View style={styles.tabContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={batches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedBatchId;
            return (
              <TouchableOpacity
                onPress={() => setSelectedBatchId(item.id)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text style={[styles.tabText, { color: isSelected ? colors.primaryText : colors.text }]}>
                  {item.name.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Report List */}
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={studentReports}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              NO EVALUATION DATA COMPUTED FOR THIS BATCH YET.
            </Text>
          }
          renderItem={({ item }: any) => {
            const pct = item.attendancePercentage || item.percentage || 0;
            return (
              <View style={[styles.reportCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View>
                  <Text style={[styles.studentName, { color: colors.text }]}>
                    {item.studentName.toUpperCase()}
                  </Text>
                  <Text style={[styles.rollNum, { color: colors.textMuted }]}>
                    ROLL NUMBER: {item.rollNumber}
                  </Text>
                </View>
                <View style={styles.stats}>
                  <Text style={[styles.statValue, { color: pct < 75 ? colors.error : colors.success }]}>
                    {pct}%
                  </Text>
                  <Text style={[styles.statLbl, { color: colors.textMuted }]}>ATTENDANCE</Text>
                </View>
              </View>
            );
          }}
        />
      )}
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
    textAlign: 'center',
  },
  tabContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    height: 48,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    borderWidth: 1.5,
    marginRight: spacing.sm,
    justifyContent: 'center',
    height: 36,
  },
  tabText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.md,
  },
  reportCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  studentName: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  rollNum: {
    fontSize: 9,
    marginTop: 2,
  },
  stats: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  statLbl: {
    fontSize: 8,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
