import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from 'react-native';
import { useAuthStore } from '../../state/useAuthStore';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { theme, spacing, typography } from '../../theme/colors';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, themeMode, setThemeMode } = useAuthStore();
  const colors = theme[themeMode];

  const handleLogout = async () => {
    await logout();
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  if (!user) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatarBox, { borderColor: colors.accent, backgroundColor: colors.surface }]}>
            <Text style={[styles.avatarInitials, { color: colors.accent }]}>
              {user.email.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.nameText, { color: colors.text }]}>
            {user.student ? `${user.student.firstName} ${user.student.lastName}` :
             user.faculty ? `${user.faculty.firstName} ${user.faculty.lastName}` :
             user.parent ? `${user.parent.fatherName}` : 'ADMINISTRATOR'}
          </Text>
          <Text style={[styles.roleBadge, { backgroundColor: colors.primary, color: colors.primaryText }]}>
            {user.role}
          </Text>
        </View>

        <Card title="SECURITY PROFILE INFORMATION" style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>EMAIL ADDRESS</Text>
            <Text style={[styles.infoVal, { color: colors.text }]}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>PHONE NUMBER</Text>
            <Text style={[styles.infoVal, { color: colors.text }]}>{user.phone || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>TENANT ID</Text>
            <Text style={[styles.infoVal, { color: colors.text, fontSize: 10 }]}>{user.tenantId}</Text>
          </View>
        </Card>

        {user.student && (
          <Card title="STUDENT DATA" style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>ROLL NUMBER</Text>
              <Text style={[styles.infoVal, { color: colors.text }]}>{user.student.rollNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>TARGET EXAM</Text>
              <Text style={[styles.infoVal, { color: colors.text }]}>{user.student.targetExam?.join(', ') || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>ACADEMIC STATUS</Text>
              <Text style={[styles.infoVal, { color: colors.success }]}>{user.student.status}</Text>
            </View>
          </Card>
        )}

        {user.faculty && (
          <Card title="FACULTY DATA" style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>EMPLOYEE ID</Text>
              <Text style={[styles.infoVal, { color: colors.text }]}>{user.faculty.employeeId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>SPECIALIZATION</Text>
              <Text style={[styles.infoVal, { color: colors.text }]}>{user.faculty.specialization?.join(', ') || 'N/A'}</Text>
            </View>
          </Card>
        )}

        {user.parent && (
          <Card title="PARENT PORTAL DETAILS" style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>FATHER NAME</Text>
              <Text style={[styles.infoVal, { color: colors.text }]}>{user.parent.fatherName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>MOTHER NAME</Text>
              <Text style={[styles.infoVal, { color: colors.text }]}>{user.parent.motherName || 'N/A'}</Text>
            </View>
          </Card>
        )}

        <View style={styles.actionContainer}>
          <Button
            title={`THEME: ${themeMode.toUpperCase()} MODE`}
            variant="secondary"
            onPress={toggleTheme}
            style={styles.actionBtn}
          />
          <Button
            title="CHANGE PASSCODE"
            variant="secondary"
            onPress={() => navigation.navigate('ChangePassword')}
            style={styles.actionBtn}
          />
          <Button
            title="SYSTEM DE-AUTHENTICATE / LOGOUT"
            variant="danger"
            onPress={handleLogout}
            style={styles.logoutBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  avatarRow: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarInitials: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
  },
  nameText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  roleBadge: {
    paddingVertical: 3,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    marginTop: spacing.xs,
    overflow: 'hidden',
    letterSpacing: 1.1,
  },
  card: {
    width: '100%',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3E4640',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
  },
  infoVal: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  actionContainer: {
    width: '100%',
    marginTop: spacing.md,
  },
  actionBtn: {
    marginBottom: spacing.sm,
  },
  logoutBtn: {
    marginTop: spacing.sm,
  },
});
