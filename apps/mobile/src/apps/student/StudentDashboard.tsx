import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { Card } from '../../components/Card';
import { OfflineBanner } from '../../components/OfflineBanner';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const StudentDashboard = ({ navigation }: any) => {
  const { user, themeMode } = useAuthStore();
  const colors = theme[themeMode];

  const studentId = user?.student?.id;

  // 1. Fetch Attendance Summary
  const { data: attendanceSum } = useQuery({
    queryKey: ['studentAttendanceSummary', studentId],
    queryFn: () => api.get(`/students/${studentId}/attendance-summary`).then((res) => res.data),
    enabled: !!studentId,
  });

  // 2. Fetch Test Performance Summary
  const { data: testSum } = useQuery({
    queryKey: ['studentTestSummary', studentId],
    queryFn: () => api.get(`/students/${studentId}/test-summary`).then((res) => res.data),
    enabled: !!studentId,
  });

  // 3. Fetch Fees Summary
  const { data: feeSum } = useQuery({
    queryKey: ['studentFeeSummary', studentId],
    queryFn: () => api.get(`/students/${studentId}/fee-summary`).then((res) => res.data),
    enabled: !!studentId,
  });

  // 4. Fetch Upcoming Online Tests
  const { data: upcomingTests } = useQuery({
    queryKey: ['upcomingOnlineTests'],
    queryFn: () => api.get('/online-tests').then((res) => res.data),
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <OfflineBanner />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: colors.textMuted }]}>WELCOME BACK, CADET</Text>
          <Text style={[styles.nameText, { color: colors.text }]}>
            {user?.student?.firstName.toUpperCase()} {user?.student?.lastName.toUpperCase()}
          </Text>
          <Text style={[styles.rollText, { color: colors.accent }]}>
            ROLL NUMBER: {user?.student?.rollNumber}
          </Text>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate('Attendance')}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>ATTENDANCE</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {attendanceSum?.attendancePercentage != null ? `${attendanceSum.attendancePercentage}%` : 'N/A'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate('Results')}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>AVG SCORE</Text>
            <Text style={[styles.statValue, { color: colors.accent }]}>
              {testSum?.averagePercentage != null ? `${Math.round(testSum.averagePercentage)}%` : 'N/A'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Exams Card */}
        <Card title="UPCOMING ONLINE EXAMS" variant="accent">
          {upcomingTests?.data?.length > 0 ? (
            upcomingTests.data.slice(0, 2).map((test: any) => (
              <TouchableOpacity
                key={test.id}
                style={[styles.testRow, { borderBottomColor: colors.border }]}
                onPress={() => navigation.navigate('Exam', { testId: test.id })}
              >
                <View>
                  <Text style={[styles.testName, { color: colors.text }]}>{test.name.toUpperCase()}</Text>
                  <Text style={[styles.testDate, { color: colors.textMuted }]}>DATE: {new Date(test.testDate).toLocaleDateString()}</Text>
                </View>
                <Text style={[styles.actionBadge, { color: colors.accent, borderColor: colors.accent }]}>START</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>NO EXAMS SCHEDULED CURRENTLY.</Text>
          )}
        </Card>

        {/* Quick Navigation Cards */}
        <Card title="TACTICAL NAVIGATION MODULES">
          <View style={styles.navGrid}>
            <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.surfaceElevated }]} onPress={() => navigation.navigate('Leaderboard')}>
              <Text style={[styles.navBtnText, { color: colors.text }]}>🏆 LEADERBOARD</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.surfaceElevated }]} onPress={() => navigation.navigate('Materials')}>
              <Text style={[styles.navBtnText, { color: colors.text }]}>📚 MATERIALS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.surfaceElevated }]} onPress={() => navigation.navigate('Assignments')}>
              <Text style={[styles.navBtnText, { color: colors.text }]}>📝 ASSIGNMENTS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.surfaceElevated }]} onPress={() => navigation.navigate('Profile')}>
              <Text style={[styles.navBtnText, { color: colors.text }]}>⚙️ SETTINGS/PROFILE</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Fee Alert Card */}
        {feeSum?.outstandingAmount > 0 && (
          <Card title="FEE ALERT STATUS" variant="error">
            <View style={styles.feeContainer}>
              <Text style={[styles.feeAlertText, { color: colors.error }]}>
                OUTSTANDING DUES DETECTED: ₹{feeSum.outstandingAmount}
              </Text>
              <Text style={[styles.feeSub, { color: colors.textMuted }]}>
                Please resolve your pending installments to avoid access suspension.
              </Text>
            </View>
          </Card>
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
    marginBottom: spacing.lg,
    paddingVertical: spacing.xs,
  },
  welcomeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.5,
  },
  nameText: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
    letterSpacing: 1,
  },
  rollText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 0.48,
    padding: spacing.md,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.1,
  },
  statValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
    marginTop: spacing.xs,
  },
  testRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  testName: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
    letterSpacing: 0.5,
  },
  testDate: {
    fontSize: 10,
    marginTop: 2,
  },
  actionBadge: {
    fontSize: 10,
    fontWeight: typography.weights.heavy,
    borderWidth: 1.5,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: '48%',
    padding: spacing.md,
    borderRadius: 6,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  navBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  feeContainer: {
    alignItems: 'center',
  },
  feeAlertText: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.md,
    letterSpacing: 0.5,
  },
  feeSub: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: 4,
  },
});
