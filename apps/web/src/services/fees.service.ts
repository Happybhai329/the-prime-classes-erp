import api from '@/lib/api';

export const feesService = {
  // --- Fee Plans ---
  getPlans: async (params?: Record<string, any>) => {
    const res = await api.get('/fees/plans', { params });
    return res.data;
  },
  getPlan: async (id: string) => {
    const res = await api.get(`/fees/plans/${id}`);
    return res.data.data;
  },
  createPlan: async (data: Record<string, any>) => {
    const res = await api.post('/fees/plans', data);
    return res.data.data;
  },
  updatePlan: async (id: string, data: Record<string, any>) => {
    const res = await api.patch(`/fees/plans/${id}`, data);
    return res.data.data;
  },
  deletePlan: async (id: string) => {
    const res = await api.delete(`/fees/plans/${id}`);
    return res.data.data;
  },

  // --- Student Fees ---
  getStudentFees: async (params?: Record<string, any>) => {
    const res = await api.get('/fees/student-fees', { params });
    return res.data;
  },
  getStudentFee: async (id: string) => {
    const res = await api.get(`/fees/student-fees/${id}`);
    return res.data.data;
  },
  assignPlan: async (data: Record<string, any>) => {
    const res = await api.post('/fees/student-fees/assign', data);
    return res.data.data;
  },
  bulkAssignPlan: async (data: Record<string, any>) => {
    const res = await api.post('/fees/student-fees/bulk-assign', data);
    return res.data.data;
  },

  // --- Payments ---
  getPayments: async (params?: Record<string, any>) => {
    const res = await api.get('/fees/payments', { params });
    return res.data;
  },
  recordPayment: async (data: Record<string, any>) => {
    const res = await api.post('/fees/payments', data);
    return res.data.data;
  },
  adjustPayment: async (data: Record<string, any>) => {
    const res = await api.post('/fees/payments/adjust', data);
    return res.data.data;
  },

  // --- Receipts ---
  getReceipts: async (params?: Record<string, any>) => {
    const res = await api.get('/fees/receipts', { params });
    return res.data;
  },
  getReceipt: async (id: string) => {
    const res = await api.get(`/fees/receipts/${id}`);
    return res.data.data;
  },
  generateReceipt: async (paymentId: string) => {
    const res = await api.post(`/fees/receipts/generate/${paymentId}`);
    return res.data.data;
  },
  verifyReceipt: async (paymentId: string) => {
    const res = await api.get(`/fees/receipts/verify/${paymentId}`);
    return res.data;
  },

  // --- Discounts ---
  applyDiscount: async (data: Record<string, any>) => {
    const res = await api.post('/fees/discounts', data);
    return res.data.data;
  },
  removeDiscount: async (id: string) => {
    const res = await api.delete(`/fees/discounts/${id}`);
    return res.data.data;
  },

  // --- Refunds ---
  getRefunds: async (params?: Record<string, any>) => {
    const res = await api.get('/fees/refunds', { params });
    return res.data;
  },
  createRefund: async (data: Record<string, any>) => {
    const res = await api.post('/fees/refunds', data);
    return res.data.data;
  },
  updateRefundStatus: async (id: string, data: Record<string, any>) => {
    const res = await api.patch(`/fees/refunds/${id}/status`, data);
    return res.data.data;
  },

  // --- Dashboard ---
  getDashboardStats: async () => {
    const res = await api.get('/fees/dashboard');
    return res.data.data;
  },
  getMonthlyRevenue: async (year?: number) => {
    const res = await api.get('/fees/dashboard/monthly-revenue', { params: { year } });
    return res.data.data;
  },
  getBatchRevenue: async (academicYear?: string) => {
    const res = await api.get('/fees/dashboard/batch-revenue', { params: { academicYear } });
    return res.data.data;
  },
  getCollectionTrend: async (days?: number) => {
    const res = await api.get('/fees/dashboard/collection-trend', { params: { days } });
    return res.data.data;
  },
  getOutstandingTrend: async () => {
    const res = await api.get('/fees/dashboard/outstanding-trend');
    return res.data.data;
  },

  // --- Reports ---
  getDailyCollectionReport: async (params?: Record<string, any>) => {
    const res = await api.get('/fees/reports/daily-collection', { params });
    return res.data.data;
  },
  getMonthlyCollectionReport: async (params?: Record<string, any>) => {
    const res = await api.get('/fees/reports/monthly-collection', { params });
    return res.data.data;
  },
  getStudentLedgerReport: async (studentId: string) => {
    const res = await api.get(`/fees/reports/student-ledger/${studentId}`);
    return res.data.data;
  },
  getBatchRevenueReport: async (batchId: string, params?: Record<string, any>) => {
    const res = await api.get(`/fees/reports/batch-revenue/${batchId}`, { params });
    return res.data.data;
  },
  getOutstandingReport: async (params?: Record<string, any>) => {
    const res = await api.get('/fees/reports/outstanding', { params });
    return res.data.data;
  },
  getParentLedgerReport: async () => {
    const res = await api.get('/fees/reports/parent-ledger');
    return res.data.data;
  },
};
