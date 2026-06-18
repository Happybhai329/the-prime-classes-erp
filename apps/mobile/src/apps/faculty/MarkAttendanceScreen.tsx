import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { Button } from '../../components/Button';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const MarkAttendanceScreen = ({ navigation }: any) => {
  const { themeMode, addToOfflineQueue } = useAuthStore();
  const colors = theme[themeMode];

  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<'MORNING' | 'AFTERNOON' | 'SUBJECT'>('MORNING');
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'>>({});

  // 1. Fetch Batches
  const { data: batchesRes } = useQuery({
    queryKey: ['batchesList'],
    queryFn: () => api.get('/batches').then((res) => res.data),
  });

  const batches = batchesRes?.data || [];

  // Default to first batch
  useEffect(() => {
    if (batches.length > 0 && !selectedBatchId) {
      setSelectedBatchId(batches[0].id);
    }
  }, [batches]);

  // 2. Fetch Students of Selected Batch
  const { data: studentsRes, isLoading: loadingStudents } = useQuery({
    queryKey: ['batchStudents', selectedBatchId],
    queryFn: () => api.get('/students', { params: { batchId: selectedBatchId } }).then((res) => res.data),
    enabled: !!selectedBatchId,
  });

  const students = studentsRes?.data || [];

  // Initialize records to PRESENT
  useEffect(() => {
    if (students.length > 0) {
      const records: any = {};
      students.forEach((s: any) => {
        records[s.id] = 'PRESENT';
      });
      setAttendanceRecords(records);
    }
  }, [students]);

  const handleMark = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE') => {
    setAttendanceRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleCommitAttendance = async () => {
    if (!selectedBatchId) return;

    const formattedRecords = Object.keys(attendanceRecords).map((studentId) => ({
      studentId,
      status: attendanceRecords[studentId],
    }));

    const payload = {
      batchId: selectedBatchId,
      sessionDate: new Date().toISOString().split('T')[0],
      sessionType,
      records: formattedRecords,
    };

    try {
      // Check online connectivity
      await api.get('/health', { timeout: 3000 });
      
      // Online pathway
      await api.post('/attendance/sessions', payload);
      Alert.alert('Success', 'Attendance session uploaded and finalized.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch {
      // Offline pathway: queue request in Zustand offline store
      addToOfflineQueue('/attendance/sessions', 'POST', payload);
      Alert.alert(
        'Offline Action Saved',
        'Device is offline. Attendance records have been added to the sync queue and will upload automatically when connection is restored.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>ROLL CALL REGISTRY</Text>
      </View>

      {/* Batch selector tabs */}
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

      {/* Session type selector */}
      <View style={styles.sessionRow}>
        {['MORNING', 'AFTERNOON', 'SUBJECT'].map((type) => {
          const isSelected = type === sessionType;
          return (
            <TouchableOpacity
              key={type}
              onPress={() => setSessionType(type as any)}
              style={[
                styles.sessionTab,
                {
                  backgroundColor: isSelected ? colors.accent : colors.surface,
                  borderColor: isSelected ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.sessionTabText,
                  {
                    color: isSelected ? colors.background : colors.text,
                    fontWeight: isSelected ? 'bold' : 'normal',
                  },
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Students list */}
      {loadingStudents ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }: any) => {
            const currentStatus = attendanceRecords[item.id] || 'PRESENT';

            return (
              <View style={[styles.studentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View>
                  <Text style={[styles.studentName, { color: colors.text }]}>
                    {item.firstName.toUpperCase()} {item.lastName.toUpperCase()}
                  </Text>
                  <Text style={[styles.rollText, { color: colors.textMuted }]}>
                    ROLL: {item.rollNumber}
                  </Text>
                </View>
                {/* Status Toggles */}
                <View style={styles.toggles}>
                  {(['PRESENT', 'ABSENT', 'LATE'] as const).map((status) => {
                    const isSelected = currentStatus === status;
                    const getBadgeColor = () => {
                      if (status === 'PRESENT') return colors.success;
                      if (status === 'ABSENT') return colors.error;
                      return colors.warning;
                    };
                    return (
                      <TouchableOpacity
                        key={status}
                        onPress={() => handleMark(item.id, status)}
                        style={[
                          styles.toggleBtn,
                          {
                            backgroundColor: isSelected ? getBadgeColor() : 'transparent',
                            borderColor: getBadgeColor(),
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.toggleText,
                            {
                              color: isSelected ? colors.primaryText : getBadgeColor(),
                              fontWeight: isSelected ? 'bold' : 'normal',
                            },
                          ]}
                        >
                          {status.slice(0, 1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          }}
        />
      )}

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Button title="SUBMIT ROLL CALL" onPress={handleCommitAttendance} style={styles.submitBtn} />
      </View>
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
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  sessionTab: {
    flex: 0.31,
    paddingVertical: spacing.xs,
    borderWidth: 1.5,
    borderRadius: 6,
    alignItems: 'center',
  },
  sessionTabText: {
    fontSize: 10,
    letterSpacing: 1,
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
  },
  rollText: {
    fontSize: 9,
    marginTop: 2,
  },
  toggles: {
    flexDirection: 'row',
  },
  toggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  toggleText: {
    fontSize: 10,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1.5,
  },
  submitBtn: {
    width: '100%',
  },
});
