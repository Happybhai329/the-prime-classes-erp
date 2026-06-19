import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import type { LoginRequest } from '@prime/shared-types';

export const useLogin = () => {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      login(data.accessToken, data.refreshToken, data.user);
      toast.success(`Welcome back, ${data.user.faculty?.firstName || data.user.email}!`);
      navigate('/dashboard', { replace: true });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || 'Login failed. Check your credentials.';
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      logout();
      queryClient.clear();
      navigate('/login', { replace: true });
      toast.success('Logged out successfully');
    },
  });
};

export const useProfile = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const profile = await authService.getProfile();
      setUser(profile);
      return profile;
    },
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success('If an account exists with that email, a reset link has been sent.');
    },
    onError: () => {
      toast.success('If an account exists with that email, a reset link has been sent.');
    },
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authService.verifyOtp(email, otp),
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Invalid OTP. Please try again.';
      toast.error(message);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }) =>
      authService.resetPassword(email, otp, newPassword),
    onSuccess: () => {
      toast.success('Password reset successfully! Please login with your new password.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to reset password.';
      toast.error(message);
    },
  });
};
