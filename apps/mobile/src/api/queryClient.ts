import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes cache freshness
      gcTime: 1000 * 60 * 60 * 24 * 7, // Keep garbage collected data in storage for 7 days
      refetchOnWindowFocus: false, // Don't refetch on app refocus (reduces mobile data usage)
      refetchOnReconnect: 'always', // Auto refetch when internet reconnects
      retry: 1, // Only retry failed requests once
    },
  },
});

// Custom AsyncStorage Persister to enable robust offline viewing of cached network responses
const asyncStoragePersister = {
  persistClient: async (client: any) => {
    try {
      const serializedClient = JSON.stringify(client);
      await AsyncStorage.setItem('PRIME_QUERY_CACHE', serializedClient);
    } catch (error) {
      console.warn('Failed to persist React Query cache:', error);
    }
  },
  restoreClient: async () => {
    try {
      const cache = await AsyncStorage.getItem('PRIME_QUERY_CACHE');
      if (cache) {
        return JSON.parse(cache);
      }
    } catch (error) {
      console.warn('Failed to restore React Query cache:', error);
    }
    return undefined;
  },
  removeClient: async () => {
    try {
      await AsyncStorage.removeItem('PRIME_QUERY_CACHE');
    } catch (error) {
      console.warn('Failed to remove React Query cache:', error);
    }
  },
};

// Bind persister to client
persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days max cache age
});
