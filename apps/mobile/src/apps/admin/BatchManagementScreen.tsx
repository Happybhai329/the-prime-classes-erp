import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const BatchManagementScreen = () => {
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];

  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);

  // 1. Fetch Batches
  const { data: batchesRes, isLoading } = useQuery({
    queryKey: ['adminBatchesList'],
    queryFn: () => api.get('/batches').then((res) => res.data),
  });

  const batches = batchesRes?.data || [];

  // 2. Fetch Students for the expanded batch
  const { data: studentsRes, isLoading: loadingStudents } = useQuery({
    queryKey: ['batchStudents', expandedBatchId],
    queryFn: () => api.get('/students', { params: { batchId: expandedBatchId } }).then((res) => res.data),
    enabled: !!expandedBatchId,
  });

  const students = studentsRes?.data || [];

  const handleToggleExpand = (batchId: string) => {
    setExpandedBatchId(expandedBatchId === batchId ? null : batchId);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>BATCH DEPLOYMENTS</Text>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={batches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              NO BATCHES SCHEDULED IN THIS TENANT.
            </Text>
          }
          renderItem={({ item }: any) => {
            const isExpanded = item.id === expandedBatchId;

            return (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TouchableOpacity onPress={() => handleToggleExpand(item.id)} style={styles.cardHeader}>
                  <View>
                    <Text style={[styles.batchName, { color: colors.text }]}>
                      {item.name.toUpperCase()}
                    </Text>
                    <Text style={[styles.batchCode, { color: colors.textMuted }]}>
                      CODE: {item.code} | EXAM: {item.targetExam}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 16, color: colors.accent }}>
                    {isExpanded ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={[styles.detailBox, { borderTopColor: colors.border }]}>
                    <Text style={[styles.boxTitle, { color: colors.text }]}>ENROLLED CADETS</Text>
                    {loadingStudents ? (
                      <ActivityIndicator color={colors.accent} size="small" />
                    ) : students.length > 0 ? (
                      students.map((student: any) => (
                        <View key={student.id} style={styles.studentRow}>
                          <Text style={[styles.studentName, { color: colors.text }]}>
                            👤 {student.firstName.toUpperCase()} {student.lastName.toUpperCase()}
                          </Text>
                          <Text style={[styles.studentRoll, { color: colors.textMuted }]}>
                            ROLL: {student.rollNumber}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={[styles.emptyText, { color: colors.textMuted }]}>NO STUDENTS ENROLLED.</Text>
                    )}
                  </View>
                )}
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
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  batchName: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  batchCode: {
    fontSize: 9,
    marginTop: 2,
  },
  detailBox: {
    borderTopWidth: 1.5,
    padding: spacing.md,
  },
  boxTitle: {
    fontSize: 9,
    fontWeight: typography.weights.heavy,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3E4640',
  },
  studentName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  studentRoll: {
    fontSize: 9,
  },
  emptyText: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
