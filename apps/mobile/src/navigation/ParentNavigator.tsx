import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ParentDashboard } from '../apps/parent/ParentDashboard';
import { ChildProgressScreen } from '../apps/parent/ChildProgressScreen';
import { AttendanceView } from '../apps/parent/AttendanceView';
import { ResultsView } from '../apps/parent/ResultsView';
import { FeeLedgerScreen } from '../apps/parent/FeeLedgerScreen';
import { NoticesScreen } from '../apps/parent/NoticesScreen';
import { DocumentsScreen } from '../apps/parent/DocumentsScreen';
import { ProfileScreen } from '../apps/auth/ProfileScreen';
import { ChangePasswordScreen } from '../apps/auth/ChangePasswordScreen';
import { theme } from '../theme/colors';
import { useAuthStore } from '../state/useAuthStore';

const Stack = createStackNavigator();

export const ParentNavigator = () => {
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
        component={ParentDashboard}
        options={{ title: 'PARENT PORTAL PANEL' }}
      />
      <Stack.Screen
        name="ChildProgress"
        component={ChildProgressScreen}
        options={{ title: 'PERFORMANCE ANALYSIS' }}
      />
      <Stack.Screen
        name="ChildAttendance"
        component={AttendanceView}
        options={{ title: 'ATTENDANCE REGISTRY' }}
      />
      <Stack.Screen
        name="ChildResults"
        component={ResultsView}
        options={{ title: 'EXAMINATION STATS' }}
      />
      <Stack.Screen
        name="FeeLedger"
        component={FeeLedgerScreen}
        options={{ title: 'FINANCIAL STATEMENT' }}
      />
      <Stack.Screen
        name="Notices"
        component={NoticesScreen}
        options={{ title: 'CENTRAL BULLETINS' }}
      />
      <Stack.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{ title: 'REGISTRY COMPLIANCE' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'PARENT SETTINGS' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'CHANGE SECURE PASSCODE' }}
      />
    </Stack.Navigator>
  );
};
