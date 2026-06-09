import api from '@/lib/api';

export const studentService = {
  getAll: async (params: Record<string, any>) => {
    const res = await api.get('/students', { params });
    return res.data.data;
  },
  getOne: async (id: string) => {
    const res = await api.get(`/students/${id}`);
    return res.data.data;
  },
  create: async (data: Record<string, any>) => {
    const res = await api.post('/students', data);
    return res.data.data;
  },
  update: async (id: string, data: Record<string, any>) => {
    const res = await api.patch(`/students/${id}`, data);
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/students/${id}`);
    return res.data.data;
  },
  getAttendanceSummary: async (id: string) => {
    const res = await api.get(`/students/${id}/attendance-summary`);
    return res.data.data;
  },
  getTestSummary: async (id: string) => {
    const res = await api.get(`/students/${id}/test-summary`);
    return res.data.data;
  },
  getFeeSummary: async (id: string) => {
    const res = await api.get(`/students/${id}/fee-summary`);
    return res.data.data;
  },
  exportCsv: async (params: Record<string, any>) => {
    const res = await api.get('/students/export/csv', { params, responseType: 'blob' });
    return res.data;
  },
};
