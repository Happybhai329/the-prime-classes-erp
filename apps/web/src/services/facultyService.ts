import api from '@/lib/api';

export const facultyService = {
  getAll: async (params: Record<string, any>) => {
    const res = await api.get('/faculty', { params });
    return res.data.data;
  },
  getOne: async (id: string) => {
    const res = await api.get(`/faculty/${id}`);
    return res.data.data;
  },
  create: async (data: Record<string, any>) => {
    const res = await api.post('/faculty', data);
    return res.data.data;
  },
  update: async (id: string, data: Record<string, any>) => {
    const res = await api.patch(`/faculty/${id}`, data);
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/faculty/${id}`);
    return res.data.data;
  },
  assignToBatch: async (id: string, batchId: string, subjectId: string) => {
    const res = await api.post(`/faculty/${id}/assign-batch`, { batchId, subjectId });
    return res.data.data;
  },
  removeFromBatch: async (id: string, batchSubjectId: string) => {
    const res = await api.delete(`/faculty/${id}/batch-subject/${batchSubjectId}`);
    return res.data.data;
  },
};
