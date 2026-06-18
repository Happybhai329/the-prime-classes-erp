import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { Card } from '../../components/Card';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const FeeLedgerScreen = ({ route }: any) => {
  const { studentId } = route.params;
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];

  const { data: feeReport, isLoading } = useQuery({
    queryKey: ['parentStudentFees', studentId],
    queryFn: () => api.get(`/students/${studentId}/fee-summary`).then((res) => res.data),
    enabled: !!studentId,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return colors.success;
      case 'PARTIAL':
        return colors.warning;
      case 'OVERDUE':
      case 'PENDING':
      default:
        return colors.error;
    }
  };

  const invoices = feeReport?.invoices || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>FEES ACCOUNTING STATEMENT</Text>
        </View>

        {/* Fee Stats Summary */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL NET FEE</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              ₹{feeReport?.totalFee ?? 0}
            </Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL PAID</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>
              ₹{feeReport?.paidAmount ?? 0}
            </Text>
          </View>
        </View>

        {feeReport?.outstandingAmount > 0 && (
          <Card title="OUTSTANDING DUES SUMMARY" variant="error">
            <View style={styles.outstandingBox}>
              <Text style={[styles.outstandingVal, { color: colors.error }]}>
                ₹{feeReport.outstandingAmount}
              </Text>
              <Text style={[styles.outstandingLbl, { color: colors.textMuted }]}>
                CURRENT OUTSTANDING DUES REMAINING
              </Text>
            </View>
          </Card>
        )}

        {/* Installments Invoices */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>INSTALLMENT INVOICES</Text>
        {invoices.length > 0 ? (
          invoices.map((invoice: any) => (
            <View key={invoice.id} style={[styles.invoiceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.invoiceHeader}>
                <View>
                  <Text style={[styles.invoiceNum, { color: colors.text }]}>
                    INV: {invoice.invoiceNumber}
                  </Text>
                  <Text style={[styles.invoiceDate, { color: colors.textMuted }]}>
                    DUE: {new Date(invoice.dueDate).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[styles.statusBadge, { color: getStatusColor(invoice.status), borderColor: getStatusColor(invoice.status) }]}>
                  {invoice.status}
                </Text>
              </View>
              <View style={styles.invoiceBody}>
                <Text style={[styles.planName, { color: colors.text }]}>
                  {invoice.feeStructure?.name || 'Academic Fees'}
                </Text>
                <Text style={[styles.invoiceAmount, { color: colors.accent }]}>
                  ₹{invoice.amount}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>NO ACTIVE FEE INVOICES RECORDED.</Text>
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
    textAlign: 'center',
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
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.heavy,
    marginTop: spacing.xs,
  },
  outstandingBox: {
    alignItems: 'center',
  },
  outstandingVal: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
  },
  outstandingLbl: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    marginTop: spacing.xs,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  invoiceCard: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3E4640',
    paddingBottom: spacing.xs,
    marginBottom: spacing.sm,
  },
  invoiceNum: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  invoiceDate: {
    fontSize: 9,
  },
  statusBadge: {
    fontSize: 8,
    fontWeight: typography.weights.bold,
    borderWidth: 1,
    paddingVertical: 1,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    overflow: 'hidden',
  },
  invoiceBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  invoiceAmount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  emptyText: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
