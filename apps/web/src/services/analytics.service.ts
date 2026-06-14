import api from '@/lib/api';

export const analyticsService = {
  getStudentPrediction: async (studentId: string) => {
    const res = await api.get(`/analytics/student/${studentId}/prediction`);
    return res.data.data;
  },

  getStudentWeakTopics: async (studentId: string) => {
    const res = await api.get(`/analytics/student/${studentId}/weak-topics`);
    return res.data.data;
  },

  getStudentRecommendations: async (studentId: string) => {
    const res = await api.get(`/analytics/student/${studentId}/recommendations`);
    return res.data.data;
  },

  getBatchPrediction: async (batchId: string) => {
    const res = await api.get(`/analytics/batch/${batchId}/prediction`);
    return res.data.data;
  },

  getBatchRiskAlerts: async (batchId: string) => {
    const res = await api.get(`/analytics/batch/${batchId}/risk-alerts`);
    return res.data.data;
  },

  getAdminIntelligence: async () => {
    const res = await api.get('/analytics/admin/intelligence');
    return res.data.data;
  },

  getQuestionAnalytics: async () => {
    const res = await api.get('/analytics/questions/analytics');
    return res.data.data;
  },

  triggerSync: async () => {
    const res = await api.post('/analytics/sync');
    return res.data;
  },

  downloadPdfReportUrl: (studentId: string) => {
    // Return direct API URL for downloading report with auth headers or let Axios handle download
    return `${api.defaults.baseURL}/analytics/student/${studentId}/report/pdf`;
  },
};
