import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { Input } from '../../components/Input';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const StudentManagementScreen = () => {
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');

  // 1. Fetch Students
  const { data: studentsRes, isLoading } = useQuery({
    queryKey: ['adminStudentsList', search],
    queryFn: () => api.get('/students', { params: { search: search || undefined } }).then((res) => res.data),
  });

  const students = studentsRes?.data || [];

  // 2. Toggle Status Mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/students/${id}`, { status }),
    onSuccess: () => {
      Alert.alert('Success', 'Student status updated.');
      queryClient.invalidateQueries({ queryKey: ['adminStudentsList'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update student.');
    },
  });

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    Alert.alert(
      'Alter Status',
      `Toggle student status to ${nextStatus}?`,
      [
        { text: 'CANCEL', style: 'cancel' },
        { text: 'PROCEED', onPress: () => toggleMutation.mutate({ id, status: nextStatus }) }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>CADET DIRECTORY REGISTRY</Text>
      </View>

      <View style={styles.searchBar}>
        <Input
          placeholder="SEARCH BY NAME OR ROLL NUMBER"
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.searchContainer}
        />
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              NO CADET RECORDS MATCHING QUERY FOUND.
            </Text>
          }
          renderItem={({ item }: any) => {
            const isActive = item.status === 'ACTIVE';

            return (
              <View style={[styles.studentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View>
                  <Text style={[styles.studentName, { color: colors.text }]}>
                    {item.firstName.toUpperCase()} {item.lastName.toUpperCase()}
                  </Text>
                  <Text style={[styles.rollNum, { color: colors.textMuted }]}>
                    ROLL: {item.rollNumber} | {item.classStudying}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleToggleStatus(item.id, item.status)}
                  style={[
                    styles.statusBtn,
                    {
                      backgroundColor: isActive ? colors.success : colors.error,
                      borderColor: isActive ? colors.success : colors.error,
                    },
                  ]}
                >
                  <Text style={[styles.statusBtnText, { color: colors.primaryText }]}>
                    {isActive ? 'ACTIVE' : 'LOCKED'}
                  </Text>
                </TouchableOpacity>
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
  searchBar: {
    paddingHorizontal: spacing.md,
  },
  searchContainer: {
    marginBottom: spacing.xs,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.md,
  },
  studentCard: {
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
    letterSpacing: 0.5,
  },
  rollNum: {
    fontSize: 9,
    marginTop: 2,
  },
  statusBtn: {
    borderWidth: 1.5,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
  },
  statusBtnText: {
    fontSize: 8,
    fontWeight: typography.weights.heavy,
    letterSpacing: 0.8,
  },
  emptyText: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
