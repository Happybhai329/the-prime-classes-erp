import api from '@/lib/api';

export const dashboardService = {
  getAdminDashboard: async () => {
    const res = await api.get('/dashboard/admin');
    return res.data.data;
  },

  getStudentGrowth: async () => {
    const res = await api.get('/dashboard/admin/charts/student-growth');
    return res.data.data;
  },

  getAttendanceTrends: async () => {
    const res = await api.get('/dashboard/admin/charts/attendance-trends');
    return res.data.data;
  },

  getFeeTrends: async () => {
    const res = await api.get('/dashboard/admin/charts/fee-trends');
    return res.data.data;
  },

  getParentDashboard: async () => {
    const res = await api.get('/dashboard/parent');
    return res.data.data;
  },

  getChildAnalytics: async (studentId: string) => {
    const res = await api.get(`/dashboard/parent/child/${studentId}/analytics`);
    return res.data.data;
  },
};
