import api from '@/lib/api';
import type { ApiResponse } from '@prime/shared-types';

export const superAdminService = {
  getTenants: async () => {
    const res = await api.get<ApiResponse<any[]>>('/super-admin/tenants');
    return res.data.data;
  },

  toggleTenantStatus: async (id: string, isActive: boolean) => {
    const res = await api.patch<ApiResponse<any>>(`/super-admin/tenants/${id}/status`, { isActive });
    return res.data.data;
  },

  getPlans: async () => {
    const res = await api.get<ApiResponse<any[]>>('/super-admin/plans');
    return res.data.data;
  },

  upgradePlan: async (tenantId: string, planId: string) => {
    const res = await api.post<ApiResponse<any>>(`/super-admin/tenants/${tenantId}/upgrade`, { planId });
    return res.data.data;
  },

  getRevenueStats: async () => {
    const res = await api.get<ApiResponse<any>>('/super-admin/revenue');
    return res.data.data;
  },

  getTickets: async () => {
    const res = await api.get<ApiResponse<any[]>>('/super-admin/tickets');
    return res.data.data;
  },

  respondToTicket: async (ticketId: string, content: string) => {
    const res = await api.post<ApiResponse<any>>(`/super-admin/tickets/${ticketId}/respond`, { content });
    return res.data.data;
  },
};
export default superAdminService;
