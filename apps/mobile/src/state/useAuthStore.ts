import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api/client';

export interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT' | 'ACCOUNTANT';
  tenantId: string;
  isActive: boolean;
  student?: {
    id: string;
    rollNumber: string;
    firstName: string;
    lastName: string;
    status: string;
    targetExam: string[];
  };
  parent?: {
    id: string;
    fatherName: string;
    motherName: string | null;
    fatherPhone: string;
    motherPhone: string | null;
  };
  faculty?: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    specialization: string[];
  };
}

export interface OfflineRequest {
  id: string;
  url: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  data: any;
  timestamp: number;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  themeMode: 'light' | 'dark';
  offlineQueue: OfflineRequest[];
  
  login: (emailOrPhone: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  recoverSession: () => Promise<boolean>;
  setThemeMode: (mode: 'light' | 'dark') => void;
  addToOfflineQueue: (url: string, method: OfflineRequest['method'], data: any) => void;
  removeFromOfflineQueue: (id: string) => void;
  clearOfflineQueue: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  themeMode: 'dark', // Tactical dark theme by default
  offlineQueue: [],

  login: async (emailOrPhone, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', {
        email: emailOrPhone, // Maps to email field which now supports email or phone
        password,
      });

      const { accessToken, refreshToken, user } = response.data;

      // Save tokens securely
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await SecureStore.setItemAsync('userProfile', JSON.stringify(user));

      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid credentials';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout').catch(() => {}); // Call logout, ignore errors if token already invalid
    } finally {
      // Clear local storage
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('userProfile');

      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  recoverSession: async () => {
    set({ isLoading: true });
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const savedUser = await SecureStore.getItemAsync('userProfile');
      
      if (accessToken && savedUser) {
        set({ user: JSON.parse(savedUser), isAuthenticated: true, isLoading: false });
        
        // Asynchronously check profile to ensure token is valid and update values
        api.get('/auth/me').then(async (res) => {
          const freshUser = res.data;
          // Merge relationships
          const updatedUser = { ...JSON.parse(savedUser), ...freshUser };
          await SecureStore.setItemAsync('userProfile', JSON.stringify(updatedUser));
          set({ user: updatedUser });
        }).catch(() => {
          // If profile check fails with 401, interceptor triggers refresh. If refresh fails, user gets logged out.
        });

        return true;
      }
      set({ isLoading: false });
      return false;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  setThemeMode: (mode) => set({ themeMode: mode }),

  addToOfflineQueue: (url, method, data) => {
    const newRequest: OfflineRequest = {
      id: Math.random().toString(36).substring(7),
      url,
      method,
      data,
      timestamp: Date.now(),
    };
    set((state) => ({
      offlineQueue: [...state.offlineQueue, newRequest],
    }));
  },

  removeFromOfflineQueue: (id) => {
    set((state) => ({
      offlineQueue: state.offlineQueue.filter((req) => req.id !== id),
    }));
  },

  clearOfflineQueue: () => set({ offlineQueue: [] }),
}));
