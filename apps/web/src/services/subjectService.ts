import api from '@/lib/api';

export const subjectService = {
  getAll: async (params?: Record<string, any>) => {
    const res = await api.get('/subjects', { params });
    return res.data.data;
  },
  getOne: async (id: string) => {
    const res = await api.get(`/subjects/${id}`);
    return res.data.data;
  },
  create: async (data: Record<string, any>) => {
    const res = await api.post('/subjects', data);
    return res.data.data;
  },
  update: async (id: string, data: Record<string, any>) => {
    const res = await api.patch(`/subjects/${id}`, data);
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/subjects/${id}`);
    return res.data.data;
  },
};
