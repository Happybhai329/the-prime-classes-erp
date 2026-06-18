import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { StudentDashboard } from '../apps/student/StudentDashboard';
import { AttendanceScreen } from '../apps/student/AttendanceScreen';
import { ResultsScreen } from '../apps/student/ResultsScreen';
import { LeaderboardScreen } from '../apps/student/LeaderboardScreen';
import { MaterialsScreen } from '../apps/student/MaterialsScreen';
import { AssignmentsScreen } from '../apps/student/AssignmentsScreen';
import { ExamScreen } from '../apps/student/ExamScreen';
import { ProfileScreen } from '../apps/auth/ProfileScreen';
import { ChangePasswordScreen } from '../apps/auth/ChangePasswordScreen';
import { theme } from '../theme/colors';
import { useAuthStore } from '../state/useAuthStore';

const Stack = createStackNavigator();

export const StudentNavigator = () => {
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomWidth: 1.5,
          borderBottomColor: colors.border,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTintColor: colors.accent,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 14,
          letterSpacing: 1.2,
        },
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={StudentDashboard}
        options={{ title: 'COMMAND DASHBOARD' }}
      />
      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ title: 'ATTENDANCE REGISTRY' }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: 'ASSESSMENT REPORTS' }}
      />
      <Stack.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ title: 'BATTLE LEADERBOARD' }}
      />
      <Stack.Screen
        name="Materials"
        component={MaterialsScreen}
        options={{ title: 'DIGITAL LIBRARY' }}
      />
      <Stack.Screen
        name="Assignments"
        component={AssignmentsScreen}
        options={{ title: 'TACTICAL MISSION TASKS' }}
      />
      <Stack.Screen
        name="Exam"
        component={ExamScreen}
        options={{ title: 'ONLINE TESTING MODULE', headerLeft: () => null, gestureEnabled: false }} // Lock navigating backward during exams
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'USER SETTINGS' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'CHANGE SECURE PASSCODE' }}
      />
    </Stack.Navigator>
  );
};
