import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const AttendanceView = ({ route }: any) => {
  const { studentId } = route.params;
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];

  const { data: attendanceReport, isLoading } = useQuery({
    queryKey: ['parentStudentAttendance', studentId],
    queryFn: () => api.get(`/attendance/reports/student/${studentId}`).then((res) => res.data),
    enabled: !!studentId,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return colors.success;
      case 'ABSENT':
        return colors.error;
      case 'LATE':
        return colors.warning;
      case 'LEAVE':
      default:
        return colors.textMuted;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>CADET ATTENDANCE REPORT</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.overviewGrid}>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statNum, { color: colors.text }]}>
            {attendanceReport?.attendance?.present ?? 0}
          </Text>
          <Text style={[styles.statLbl, { color: colors.textMuted }]}>PRESENT</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statNum, { color: colors.error }]}>
            {attendanceReport?.attendance?.absent ?? 0}
          </Text>
          <Text style={[styles.statLbl, { color: colors.textMuted }]}>ABSENT</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statNum, { color: colors.accent }]}>
            {attendanceReport?.attendance?.percentage != null ? `${Math.round(attendanceReport.attendance.percentage)}%` : '0%'}
          </Text>
          <Text style={[styles.statLbl, { color: colors.textMuted }]}>PERCENTAGE</Text>
        </View>
      </View>

      <FlatList
        data={attendanceReport?.attendance?.records || []}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              NO ATTENDANCE LOGS RECORDED.
            </Text>
          ) : null
        }
        renderItem={({ item }: any) => (
          <View style={[styles.recordRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View>
              <Text style={[styles.recordDate, { color: colors.text }]}>
                {new Date(item.sessionDate || item.session.sessionDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              <Text style={[styles.recordType, { color: colors.textMuted }]}>
                SESSION: {item.sessionType || item.session.sessionType} {item.subjectName ? `[${item.subjectName}]` : ''}
              </Text>
            </View>
            <Text style={[styles.statusBadge, { color: getStatusColor(item.status), borderColor: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        )}
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
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
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
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  recordDate: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  recordType: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  statusBadge: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
