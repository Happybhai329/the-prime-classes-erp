import api from '@/lib/api';
import type { UserRole } from '@prime/shared-types';

export const userService = {
  getAll: async (params: Record<string, any>) => {
    const res = await api.get('/users', { params });
    return res.data.data;
  },
  getOne: async (id: string) => {
    const res = await api.get(`/users/${id}`);
    return res.data.data;
  },
  create: async (data: Record<string, any>) => {
    const res = await api.post('/users', data);
    return res.data.data;
  },
  update: async (id: string, data: Record<string, any>) => {
    const res = await api.patch(`/users/${id}`, data);
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    return res.data.data;
  },
  toggleActive: async (id: string) => {
    const res = await api.patch(`/users/${id}/toggle-active`);
    return res.data.data;
  },
  resetPassword: async (id: string, data: Record<string, any>) => {
    const res = await api.post(`/users/${id}/reset-password`, data);
    return res.data.data;
  },
  assignRole: async (id: string, role: UserRole) => {
    const res = await api.patch(`/users/${id}/assign-role`, { role });
    return res.data.data;
  },
};
