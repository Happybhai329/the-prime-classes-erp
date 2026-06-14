import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../state/useAuthStore';
import { LoginScreen } from '../apps/auth/LoginScreen';
import { ForgotPasswordScreen } from '../apps/auth/ForgotPasswordScreen';
import { StudentNavigator } from './StudentNavigator';
import { ParentNavigator } from './ParentNavigator';
import { FacultyNavigator } from './FacultyNavigator';
import { AdminNavigator } from './AdminNavigator';
import { theme } from '../theme/colors';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const { isAuthenticated, user, themeMode } = useAuthStore();
  const colors = theme[themeMode];

  const renderRoleNavigator = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'STUDENT':
        return <StudentNavigator />;
      case 'PARENT':
        return <ParentNavigator />;
      case 'FACULTY':
        return <FacultyNavigator />;
      case 'SUPER_ADMIN':
      case 'ADMIN':
      case 'ACCOUNTANT':
      default:
        return <AdminNavigator />;
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
        {!isAuthenticated ? (
          // Unauthorized Flow
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          // Authorized Flow - Dynamic loader depending on logged-in role
          <Stack.Screen name="RoleNavigator">
            {() => renderRoleNavigator()}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default AppNavigator;
