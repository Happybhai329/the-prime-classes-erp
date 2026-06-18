import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../state/useAuthStore';
import { theme, spacing, typography } from '../theme/colors';
import { api } from '../api/client';

export const OfflineBanner: React.FC = () => {
  const themeMode = useAuthStore((state) => state.themeMode);
  const colors = theme[themeMode];
  const { offlineQueue, removeFromOfflineQueue } = useAuthStore();
  
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Simple interval to poll online/offline status (or in production, use @react-native-community/netinfo)
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Ping health endpoint to verify internet AND server availability
        await fetch(`${api.defaults.baseURL}/health`, { method: 'GET', headers: { 'Cache-Control': 'no-cache' } });
        setIsOffline(false);
      } catch {
        setIsOffline(true);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 8000);
    return () => clearInterval(interval);
  }, []);

  // Sync Queue handler
  const handleSync = async () => {
    if (offlineQueue.length === 0 || isOffline) return;
    setIsSyncing(true);
    setSyncMessage(`Syncing ${offlineQueue.length} records...`);

    const queue = [...offlineQueue].sort((a, b) => a.timestamp - b.timestamp);

    for (const req of queue) {
      try {
        await api({
          url: req.url,
          method: req.method,
          data: req.data,
        });
        // Remove from store on success
        removeFromOfflineQueue(req.id);
      } catch (err: any) {
        // If it's a validation error (400) or authorization error (403), remove it to prevent blockage. Otherwise pause.
        if (err.response?.status && err.response.status >= 400 && err.response.status < 500) {
          removeFromOfflineQueue(req.id);
        } else {
          // Server error, stop queue processing
          break;
        }
      }
    }
    setIsSyncing(false);
  };

  // Auto-sync when transitioning from offline to online
  useEffect(() => {
    if (!isOffline && offlineQueue.length > 0 && !isSyncing) {
      handleSync();
    }
  }, [isOffline]);

  if (isOffline) {
    return (
      <View style={[styles.container, { backgroundColor: colors.warning }]}>
        <Text style={[styles.text, { color: colors.background }]}>
          OFFLINE MODE — VIEWING CACHED DATA
        </Text>
        {offlineQueue.length > 0 && (
          <Text style={[styles.subText, { color: colors.background }]}>
            {offlineQueue.length} pending actions will sync once reconnected.
          </Text>
        )}
      </View>
    );
  }

  if (offlineQueue.length > 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.primary }]}>
        <Text style={[styles.text, { color: colors.primaryText }]}>
          {isSyncing ? syncMessage.toUpperCase() : `${offlineQueue.length} PENDING ACTION(S) READY TO SYNC`}
        </Text>
        {!isSyncing && (
          <TouchableOpacity onPress={handleSync} style={[styles.syncButton, { borderColor: colors.primaryText }]}>
            {isSyncing ? (
              <ActivityIndicator size="small" color={colors.primaryText} />
            ) : (
              <Text style={[styles.syncButtonText, { color: colors.primaryText }]}>
                SYNC NOW
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '100%',
  },
  text: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.xs,
    letterSpacing: 1.1,
  },
  subText: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: typography.weights.medium,
  },
  syncButton: {
    marginTop: spacing.xs,
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
  },
  syncButtonText: {
    fontWeight: typography.weights.bold,
    fontSize: 10,
    letterSpacing: 1,
  },
});
