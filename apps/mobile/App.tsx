import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { queryClient } from './src/api/queryClient';
import { useAuthStore } from './src/state/useAuthStore';
import { AppNavigator } from './src/navigation/AppNavigator';
import { theme } from './src/theme/colors';
import { api } from './src/api/client';

// Configure push notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Suppress known styling/third-party warnings in development console
LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate`']);

export default function App() {
  const { recoverSession, isAuthenticated, user, themeMode } = useAuthStore();
  const colors = theme[themeMode];

  // 1. Recover User Session on launch
  useEffect(() => {
    recoverSession();
  }, []);

  // 2. Setup Push Notifications
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token && isAuthenticated && user) {
        // Post the token registration to the backend
        api.post('/notifications/register', {
          fcmToken: token,
          platform: Device.osName === 'iOS' ? 'IOS' : 'ANDROID',
          deviceId: Device.osBuildId || 'unknown-device',
        }).catch((err) => {
          console.warn('Failed to register push token with backend:', err.message);
        });
      }
    });

    // Foreground listener
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Push notification received in foreground:', notification);
    });

    // Click/Interaction listener
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Push notification clicked by user:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, [isAuthenticated, user]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar
        backgroundColor={colors.surface}
        barStyle={colors.statusBar}
      />
      <AppNavigator />
    </QueryClientProvider>
  );
}

// Helper: Request permissions and fetch token
async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    // Get Expo push token
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('[PUSH NOTIFICATION MODULE] Generated Token:', token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
