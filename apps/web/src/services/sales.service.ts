import api from '@/lib/api';

export const salesService = {
  // --- Dashboard ---
  getDashboardStats: async () => {
    const res = await api.get('/sales/dashboard');
    return res.data.data;
  },

  // --- Enquiries ---
  getEnquiries: async (params: Record<string, any>) => {
    const res = await api.get('/sales/enquiries', { params });
    return res.data.data;
  },
  getEnquiry: async (id: string) => {
    const res = await api.get(`/sales/enquiries/${id}`);
    return res.data.data;
  },
  createEnquiry: async (data: Record<string, any>) => {
    const res = await api.post('/sales/enquiries', data);
    return res.data.data;
  },
  updateEnquiry: async (id: string, data: Record<string, any>) => {
    const res = await api.patch(`/sales/enquiries/${id}`, data);
    return res.data.data;
  },
  deleteEnquiry: async (id: string) => {
    const res = await api.delete(`/sales/enquiries/${id}`);
    return res.data.data;
  },
  bulkDeleteEnquiries: async (ids: string[]) => {
    const res = await api.post('/sales/enquiries/bulk-delete', { ids });
    return res.data.data;
  },
  exportEnquiriesCsv: async (params: Record<string, any>) => {
    const res = await api.get('/sales/enquiries/export/csv', { params, responseType: 'blob' });
    return res.data;
  },
  importEnquiriesCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/sales/enquiries/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  // --- Follow-ups ---
  getFollowUps: async (params: Record<string, any>) => {
    const res = await api.get('/sales/followups', { params });
    return res.data.data;
  },
  getDashboardFollowUps: async () => {
    const res = await api.get('/sales/followups/dashboard');
    return res.data.data;
  },
  getFollowUpTimeline: async (enquiryId: string) => {
    const res = await api.get(`/sales/followups/timeline/${enquiryId}`);
    return res.data.data;
  },
  createFollowUp: async (data: Record<string, any>) => {
    const res = await api.post('/sales/followups', data);
    return res.data.data;
  },
  updateFollowUp: async (id: string, data: Record<string, any>) => {
    const res = await api.patch(`/sales/followups/${id}`, data);
    return res.data.data;
  },
  deleteFollowUp: async (id: string) => {
    const res = await api.delete(`/sales/followups/${id}`);
    return res.data.data;
  },

  // --- Admissions ---
  getAdmissions: async (params: Record<string, any>) => {
    const res = await api.get('/sales/admissions', { params });
    return res.data.data;
  },
  getAdmission: async (id: string) => {
    const res = await api.get(`/sales/admissions/${id}`);
    return res.data.data;
  },
  createAdmission: async (data: Record<string, any>) => {
    const res = await api.post('/sales/admissions', data);
    return res.data.data;
  },
  convertFromEnquiry: async (enquiryId: string) => {
    const res = await api.post(`/sales/admissions/convert/${enquiryId}`);
    return res.data.data;
  },
  updateAdmission: async (id: string, data: Record<string, any>) => {
    const res = await api.patch(`/sales/admissions/${id}`, data);
    return res.data.data;
  },
  deleteAdmission: async (id: string) => {
    const res = await api.delete(`/sales/admissions/${id}`);
    return res.data.data;
  },
  enrollIntoAcademic: async (id: string, data: Record<string, any>) => {
    const res = await api.post(`/sales/admissions/${id}/enroll`, data);
    return res.data.data;
  },

  // --- Counsellors ---
  getCounsellors: async (params?: Record<string, any>) => {
    const res = await api.get('/sales/counsellors', { params });
    return res.data.data;
  },
  getCounsellor: async (id: string) => {
    const res = await api.get(`/sales/counsellors/${id}`);
    return res.data.data;
  },
  createCounsellor: async (data: Record<string, any>) => {
    const res = await api.post('/sales/counsellors', data);
    return res.data.data;
  },
  updateCounsellor: async (id: string, data: Record<string, any>) => {
    const res = await api.patch(`/sales/counsellors/${id}`, data);
    return res.data.data;
  },
  deleteCounsellor: async (id: string) => {
    const res = await api.delete(`/sales/counsellors/${id}`);
    return res.data.data;
  },

  // --- Analytics ---
  getAnalytics: async () => {
    const res = await api.get('/sales/analytics');
    return res.data.data;
  },

  // --- Reports ---
  getReport: async (reportType: string) => {
    const res = await api.get(`/sales/reports/${reportType}`);
    return res.data.data;
  },
};
