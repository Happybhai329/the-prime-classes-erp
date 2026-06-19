import api from '@/lib/api';

export const parentService = {
  getAll: async (params: Record<string, any>) => {
    const res = await api.get('/parents', { params });
    return res.data.data;
  },
  getOne: async (id: string) => {
    const res = await api.get(`/parents/${id}`);
    return res.data.data;
  },
  create: async (data: Record<string, any>) => {
    const res = await api.post('/parents', data);
    return res.data.data;
  },
  update: async (id: string, data: Record<string, any>) => {
    const res = await api.patch(`/parents/${id}`, data);
    return res.data.data;
  },
  search: async (q: string) => {
    const res = await api.get('/parents/search', { params: { q } });
    return res.data.data;
  },
};

