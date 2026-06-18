import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { FacultyDashboard } from '../apps/faculty/FacultyDashboard';
import { MarkAttendanceScreen } from '../apps/faculty/MarkAttendanceScreen';
import { CreateTestScreen } from '../apps/faculty/CreateTestScreen';
import { UploadMaterialsScreen } from '../apps/faculty/UploadMaterialsScreen';
import { ReportsScreen } from '../apps/faculty/ReportsScreen';
import { ProfileScreen } from '../apps/auth/ProfileScreen';
import { ChangePasswordScreen } from '../apps/auth/ChangePasswordScreen';
import { theme } from '../theme/colors';
import { useAuthStore } from '../state/useAuthStore';

const Stack = createStackNavigator();

export const FacultyNavigator = () => {
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
        component={FacultyDashboard}
        options={{ title: 'FACULTY OPERATIONS' }}
      />
      <Stack.Screen
        name="MarkAttendance"
        component={MarkAttendanceScreen}
        options={{ title: 'ATTENDANCE REGISTRY' }}
      />
      <Stack.Screen
        name="CreateTest"
        component={CreateTestScreen}
        options={{ title: 'SCHEDULE ASSESSMENT' }}
      />
      <Stack.Screen
        name="UploadMaterials"
        component={UploadMaterialsScreen}
        options={{ title: 'UPLOAD LECTURE NOTES' }}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: 'PERFORMANCE DATA' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'FACULTY SETTINGS' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'CHANGE SECURE PASSCODE' }}
      />
    </Stack.Navigator>
  );
};
