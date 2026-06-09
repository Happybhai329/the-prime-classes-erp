import api from '@/lib/api';

export const batchService = {
  getAll: async (params: Record<string, any>) => {
    const res = await api.get('/batches', { params });
    return res.data.data;
  },
  getOne: async (id: string) => {
    const res = await api.get(`/batches/${id}`);
    return res.data.data;
  },
  create: async (data: Record<string, any>) => {
    const res = await api.post('/batches', data);
    return res.data.data;
  },
  update: async (id: string, data: Record<string, any>) => {
    const res = await api.patch(`/batches/${id}`, data);
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/batches/${id}`);
    return res.data.data;
  },
  addStudents: async (batchId: string, studentIds: string[]) => {
    const res = await api.post(`/batches/${batchId}/students`, { studentIds });
    return res.data.data;
  },
  removeStudent: async (batchId: string, studentId: string) => {
    const res = await api.delete(`/batches/${batchId}/students/${studentId}`);
    return res.data.data;
  },
  transferStudent: async (batchId: string, data: { studentId: string; targetBatchId: string }) => {
    const res = await api.post(`/batches/${batchId}/transfer`, data);
    return res.data.data;
  },
};
