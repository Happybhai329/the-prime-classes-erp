import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { Card } from '../../components/Card';
import { OfflineBanner } from '../../components/OfflineBanner';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const ParentDashboard = ({ navigation }: any) => {
  const { user, themeMode } = useAuthStore();
  const colors = theme[themeMode];

  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // 1. Fetch Parent Dashboard Data (returns children list, recent notices, unread count)
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['parentDashboardData'],
    queryFn: () => api.get('/dashboard/parent').then((res) => res.data),
  });

  const children = dashboardData?.children || [];
  const notices = dashboardData?.recentNotices || [];

  // Default to first child
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].studentId);
    }
  }, [children]);

  const selectedChild = children.find((c: any) => c.studentId === selectedChildId);

  const handleChildSwitch = (id: string) => {
    setSelectedChildId(id);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <OfflineBanner />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: colors.textMuted }]}>PARENT COMMAND CENTER</Text>
          <Text style={[styles.nameText, { color: colors.text }]}>
            {user?.parent?.fatherName.toUpperCase()}
          </Text>
          <Text style={[styles.subText, { color: colors.textMuted }]}>
            MONITORING CADET PROGRESS & COMPLIANCE
          </Text>
        </View>

        {/* Multi-Child Selector */}
        {children.length > 1 && (
          <View style={styles.childSelectorContainer}>
            <Text style={[styles.selectorTitle, { color: colors.textMuted }]}>SELECT CADET OBJECT</Text>
            <FlatList
              horizontal
              data={children}
              keyExtractor={(item) => item.studentId}
              renderItem={({ item }) => {
                const isSelected = item.studentId === selectedChildId;
                return (
                  <TouchableOpacity
                    onPress={() => handleChildSwitch(item.studentId)}
                    style={[
                      styles.childTab,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.childTabText,
                        {
                          color: isSelected ? colors.primaryText : colors.text,
                          fontWeight: isSelected ? 'bold' : 'normal',
                        },
                      ]}
                    >
                      👤 {item.studentName.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* Selected Child Details Overview */}
        {selectedChild ? (
          <View style={styles.childStatsContainer}>
            {/* Quick Metrics Grid */}
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>ATTENDANCE RATE</Text>
                <Text style={[styles.statValue, { color: selectedChild.attendancePercentage < 75 ? colors.error : colors.text }]}>
                  {selectedChild.attendancePercentage}%
                </Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>LAST TEST RANK</Text>
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  {selectedChild.lastTestRank ? `#${selectedChild.lastTestRank}` : 'N/A'}
                </Text>
              </View>
            </View>

            {/* Performance Status Banner */}
            <View
              style={[
                styles.statusBanner,
                {
                  backgroundColor:
                    selectedChild.performanceCategory === 'CRITICAL'
                      ? '#8B0000'
                      : selectedChild.performanceCategory === 'NEEDS_IMPROVEMENT'
                      ? colors.warning
                      : colors.primary,
                },
              ]}
            >
              <Text style={[styles.statusBannerText, { color: selectedChild.performanceCategory === 'NEEDS_IMPROVEMENT' ? colors.background : colors.primaryText }]}>
                EVALUATION STATUS: {selectedChild.performanceCategory}
              </Text>
            </View>

            {/* Child Specific Navigation Modules */}
            <Card title={`CADET NAV MODULES: ${selectedChild.studentName.toUpperCase()}`}>
              <View style={styles.navGrid}>
                <TouchableOpacity
                  style={[styles.navBtn, { backgroundColor: colors.surfaceElevated }]}
                  onPress={() => navigation.navigate('ChildProgress', { studentId: selectedChildId })}
                >
                  <Text style={[styles.navBtnText, { color: colors.text }]}>📈 PERFORMANCE PROFILE</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.navBtn, { backgroundColor: colors.surfaceElevated }]}
                  onPress={() => navigation.navigate('ChildAttendance', { studentId: selectedChildId })}
                >
                  <Text style={[styles.navBtnText, { color: colors.text }]}>🗓️ ATTENDANCE LOG</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.navBtn, { backgroundColor: colors.surfaceElevated }]}
                  onPress={() => navigation.navigate('ChildResults', { studentId: selectedChildId })}
                >
                  <Text style={[styles.navBtnText, { color: colors.text }]}>🏆 EXAM SCORECARDS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.navBtn, { backgroundColor: colors.surfaceElevated }]}
                  onPress={() => navigation.navigate('FeeLedger', { studentId: selectedChildId })}
                >
                  <Text style={[styles.navBtnText, { color: colors.text }]}>💳 FEE ACCOUNTING</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.navBtn, { backgroundColor: colors.surfaceElevated }]}
                  onPress={() => navigation.navigate('Documents', { studentId: selectedChildId })}
                >
                  <Text style={[styles.navBtnText, { color: colors.text }]}>📂 COMPLIANCE DOCS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.navBtn, { backgroundColor: colors.surfaceElevated }]}
                  onPress={() => navigation.navigate('Notices')}
                >
                  <Text style={[styles.navBtnText, { color: colors.text }]}>📢 BULLETINS/NOTICES</Text>
                </TouchableOpacity>
              </View>
            </Card>

            {/* Outstanding Fees alert */}
            {selectedChild.pendingFees > 0 && (
              <Card title="ACCOUNTING STATEMENT DUES" variant="error">
                <Text style={[styles.feeAlertText, { color: colors.error }]}>
                  OUTSTANDING AMOUNT: ₹{selectedChild.pendingFees}
                </Text>
                <Text style={[styles.feeAlertSub, { color: colors.textMuted }]}>
                  Please tap on Fee Accounting module to review invoice installments.
                </Text>
              </Card>
            )}
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>NO CADETS ENROLLED UNDER THIS ACCOUNT.</Text>
        )}

        {/* Notices/Bulletins List */}
        <Card title="ERP BROADCAST BULLETINS">
          {notices.length > 0 ? (
            notices.map((notice: any) => (
              <View key={notice.id} style={[styles.noticeRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.noticeTitle, { color: colors.text }]}>{notice.title.toUpperCase()}</Text>
                <Text style={[styles.noticeDesc, { color: colors.textMuted }]}>{notice.body}</Text>
                <Text style={[styles.noticeDate, { color: colors.accent }]}>
                  DATE: {new Date(notice.sentAt).toLocaleDateString()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>NO ERP BULLETIN ANNOUNCEMENTS RECORDED.</Text>
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
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
  },
  subText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
    marginTop: 2,
  },
  childSelectorContainer: {
    marginBottom: spacing.md,
  },
  selectorTitle: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  childTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    borderWidth: 1.5,
    marginRight: spacing.sm,
    justifyContent: 'center',
    height: 36,
  },
  childTabText: {
    fontSize: 11,
    letterSpacing: 0.8,
  },
  childStatsContainer: {
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statBox: {
    flex: 0.48,
    padding: spacing.md,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
    marginTop: spacing.xs,
  },
  statusBanner: {
    borderRadius: 6,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  statusBannerText: {
    fontSize: 10,
    fontWeight: typography.weights.heavy,
    letterSpacing: 1.2,
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
  feeAlertText: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  feeAlertSub: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: 4,
  },
  noticeRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  noticeTitle: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  noticeDesc: {
    fontSize: typography.sizes.xs,
    marginVertical: 4,
    lineHeight: 16,
  },
  noticeDate: {
    fontSize: 8,
    fontWeight: typography.weights.bold,
  },
  emptyText: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
