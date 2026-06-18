import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { Card } from '../../components/Card';
import { OfflineBanner } from '../../components/OfflineBanner';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const AdminDashboard = ({ navigation }: any) => {
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];

  // Fetch Admin Dashboard Data
  const { data: dashboardRes, isLoading } = useQuery({
    queryKey: ['adminDashboardData'],
    queryFn: () => api.get('/dashboard/admin').then((res) => res.data),
  });

  const stats = dashboardRes?.stats || {};
  const recentPayments = dashboardRes?.recentPayments || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <OfflineBanner />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: colors.textMuted }]}>TACTICAL OPERATIONS CONTROL UNIT</Text>
          <Text style={[styles.nameText, { color: colors.text }]}>SYSTEM ADMIN</Text>
        </View>

        {/* Analytics Grid */}
        <View style={styles.grid}>
          <View style={[styles.gridBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.gridVal, { color: colors.text }]}>{stats.activeStudents ?? 0}</Text>
            <Text style={[styles.gridLbl, { color: colors.textMuted }]}>ACTIVE STUDENTS</Text>
          </View>

          <View style={[styles.gridBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.gridVal, { color: colors.text }]}>{stats.totalFaculty ?? 0}</Text>
            <Text style={[styles.gridLbl, { color: colors.textMuted }]}>TOTAL FACULTY</Text>
          </View>

          <View style={[styles.gridBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.gridVal, { color: colors.accent }]}>
              {stats.todayAttendancePercentage != null ? `${stats.todayAttendancePercentage}%` : 'N/A'}
            </Text>
            <Text style={[styles.gridLbl, { color: colors.textMuted }]}>TODAYS ATTENDANCE</Text>
          </View>

          <View style={[styles.gridBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.gridVal, { color: colors.success }]}>₹{stats.feesCollectedThisMonth ?? 0}</Text>
            <Text style={[styles.gridLbl, { color: colors.textMuted }]}>MONTH REVENUE</Text>
          </View>
        </View>

        {/* Administration quick navigation module */}
        <Card title="TACTICAL ADMINISTRATIVE CONSOLES">
          <View style={styles.navGrid}>
            <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.surfaceElevated }]} onPress={() => navigation.navigate('StudentManagement')}>
              <Text style={[styles.navBtnText, { color: colors.text }]}>👥 CADETS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.surfaceElevated }]} onPress={() => navigation.navigate('BatchManagement')}>
              <Text style={[styles.navBtnText, { color: colors.text }]}>🛡️ BATCHES</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.surfaceElevated }]} onPress={() => navigation.navigate('FeeMonitoring')}>
              <Text style={[styles.navBtnText, { color: colors.text }]}>💳 FEE MANAGER</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.surfaceElevated }]} onPress={() => navigation.navigate('AdminNotifications')}>
              <Text style={[styles.navBtnText, { color: colors.text }]}>🚨 PUSH ALERTS</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Recent Payments list */}
        <Card title="RECENT FEE COLLECTIONS LOG">
          {recentPayments.length > 0 ? (
            recentPayments.slice(0, 3).map((payment: any) => (
              <View key={payment.id} style={[styles.paymentRow, { borderBottomColor: colors.border }]}>
                <View>
                  <Text style={[styles.payName, { color: colors.text }]}>{payment.studentName.toUpperCase()}</Text>
                  <Text style={[styles.paySub, { color: colors.textMuted }]}>REC: {payment.receiptNumber} | {payment.paymentMode}</Text>
                </View>
                <Text style={[styles.payAmt, { color: colors.success }]}>+₹{payment.amountPaid}</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>NO RECENT PAYMENTS LOGGED TODAY.</Text>
          )}
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
    marginBottom: spacing.lg,
  },
  welcomeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.5,
  },
  nameText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  gridBox: {
    width: '48%',
    padding: spacing.md,
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  gridVal: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.heavy,
  },
  gridLbl: {
    fontSize: 8,
    fontWeight: typography.weights.bold,
    marginTop: spacing.xs,
    letterSpacing: 0.8,
    textAlign: 'center',
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
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  payName: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.xs,
  },
  paySub: {
    fontSize: 8,
    marginTop: 2,
  },
  payAmt: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  emptyText: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
