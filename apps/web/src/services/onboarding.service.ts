import api from '@/lib/api';
import type { RegisterTenantRequest, VerifyEmailRequest, ProvisionTenantRequest, ApiResponse } from '@prime/shared-types';

export const onboardingService = {
  register: async (data: RegisterTenantRequest) => {
    const res = await api.post<ApiResponse<any>>('/onboarding/register', data);
    return res.data.data;
  },

  verifyEmail: async (data: VerifyEmailRequest) => {
    const res = await api.post<ApiResponse<any>>('/onboarding/verify-email', data);
    return res.data.data;
  },

  provision: async (data: ProvisionTenantRequest) => {
    const res = await api.post<ApiResponse<any>>('/onboarding/provision', data);
    return res.data.data;
  },
};
