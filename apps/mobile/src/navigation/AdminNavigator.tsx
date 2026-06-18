import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AdminDashboard } from '../apps/admin/AdminDashboard';
import { StudentManagementScreen } from '../apps/admin/StudentManagementScreen';
import { BatchManagementScreen } from '../apps/admin/BatchManagementScreen';
import { FeeMonitoringScreen } from '../apps/admin/FeeMonitoringScreen';
import { AdminNotificationsScreen } from '../apps/admin/AdminNotificationsScreen';
import { ProfileScreen } from '../apps/auth/ProfileScreen';
import { ChangePasswordScreen } from '../apps/auth/ChangePasswordScreen';
import { theme } from '../theme/colors';
import { useAuthStore } from '../state/useAuthStore';

const Stack = createStackNavigator();

export const AdminNavigator = () => {
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
        component={AdminDashboard}
        options={{ title: 'ADMIN CONTROL WORKSPACE' }}
      />
      <Stack.Screen
        name="StudentManagement"
        component={StudentManagementScreen}
        options={{ title: 'CADET DIRECTORY' }}
      />
      <Stack.Screen
        name="BatchManagement"
        component={BatchManagementScreen}
        options={{ title: 'BATCH MONITORING' }}
      />
      <Stack.Screen
        name="FeeMonitoring"
        component={FeeMonitoringScreen}
        options={{ title: 'REVENUE CONTROLLER' }}
      />
      <Stack.Screen
        name="AdminNotifications"
        component={AdminNotificationsScreen}
        options={{ title: 'DISPATCH ALERTS' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'ADMIN SETTINGS' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'CHANGE SECURE PASSCODE' }}
      />
    </Stack.Navigator>
  );
};
