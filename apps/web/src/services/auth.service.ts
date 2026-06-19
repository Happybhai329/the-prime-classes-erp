import api from '@/lib/api';
import type { LoginRequest, LoginResponse, ApiResponse } from '@prime/shared-types';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  verifyOtp: async (email: string, otp: string) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const res = await api.post('/auth/reset-password', { email, otp, newPassword });
    return res.data;
  },

  refreshToken: async (refreshToken: string) => {
    const res = await api.post('/auth/refresh', { refreshToken });
    return res.data.data;
  },
};
