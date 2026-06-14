import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../state/useAuthStore';
import { Card } from '../../components/Card';
import { OfflineBanner } from '../../components/OfflineBanner';
import { theme, spacing, typography } from '../../theme/colors';

export const FacultyDashboard = ({ navigation }: any) => {
  const { user, themeMode } = useAuthStore();
  const colors = theme[themeMode];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <OfflineBanner />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: colors.textMuted }]}>INSTRUCTOR COMMAND CENTER</Text>
          <Text style={[styles.nameText, { color: colors.text }]}>
            PROF. {user?.faculty?.firstName.toUpperCase()} {user?.faculty?.lastName.toUpperCase()}
          </Text>
          <Text style={[styles.idText, { color: colors.accent }]}>
            EMPLOYEE NUMBER: {user?.faculty?.employeeId}
          </Text>
        </View>

        {/* Tactical Actions Grid */}
        <Card title="INSTRUCTIONAL COMMAND OPERATIONS">
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated }]}
              onPress={() => navigation.navigate('MarkAttendance')}
            >
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={[styles.actionText, { color: colors.text }]}>MARK ATTENDANCE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated }]}
              onPress={() => navigation.navigate('CreateTest')}
            >
              <Text style={styles.actionIcon}>⚡</Text>
              <Text style={[styles.actionText, { color: colors.text }]}>SCHEDULE TEST</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated }]}
              onPress={() => navigation.navigate('UploadMaterials')}
            >
              <Text style={styles.actionIcon}>📁</Text>
              <Text style={[styles.actionText, { color: colors.text }]}>UPLOAD NOTES</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated }]}
              onPress={() => navigation.navigate('Reports')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={[styles.actionText, { color: colors.text }]}>VIEW REPORTS</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Specialization Domain Info */}
        <Card title="SUBJECT REGISTRIES ASSIGNED">
          {user?.faculty?.specialization && user.faculty.specialization.length > 0 ? (
            user.faculty.specialization.map((spec: string, idx: number) => (
              <View key={idx} style={[styles.specRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.specText, { color: colors.text }]}>🛡️ {spec.toUpperCase()}</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>NO SPECIALIZATIONS ENROLLED.</Text>
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
  },
  idText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
    marginTop: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: '48%',
    padding: spacing.md,
    borderRadius: 6,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  specRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  specText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
