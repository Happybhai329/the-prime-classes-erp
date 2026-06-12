import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { feesService } from '@/services/fees.service';

// --- Fee Plans Hooks ---
export const useFeePlans = (params?: Record<string, any>) =>
  useQuery({
    queryKey: ['feePlans', params],
    queryFn: () => feesService.getPlans(params),
  });

export const useFeePlan = (id: string) =>
  useQuery({
    queryKey: ['feePlan', id],
    queryFn: () => feesService.getPlan(id),
    enabled: !!id,
  });

export const useCreateFeePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => feesService.createPlan(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feePlans'] });
      toast.success('Fee plan created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create fee plan');
    },
  });
};

export const useUpdateFeePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      feesService.updatePlan(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['feePlans'] });
      qc.invalidateQueries({ queryKey: ['feePlan', variables.id] });
      toast.success('Fee plan updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update fee plan');
    },
  });
};

export const useDeleteFeePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => feesService.deletePlan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feePlans'] });
      toast.success('Fee plan deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete fee plan');
    },
  });
};

// --- Student Fee Assignment Hooks ---
export const useStudentFees = (params?: Record<string, any>) =>
  useQuery({
    queryKey: ['studentFees', params],
    queryFn: () => feesService.getStudentFees(params),
  });

export const useStudentFee = (id: string) =>
  useQuery({
    queryKey: ['studentFee', id],
    queryFn: () => feesService.getStudentFee(id),
    enabled: !!id,
  });

export const useAssignFeePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => feesService.assignPlan(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studentFees'] });
      toast.success('Fee plan assigned successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to assign fee plan');
    },
  });
};

export const useBulkAssignFeePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => feesService.bulkAssignPlan(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studentFees'] });
      toast.success('Fee plan assigned to students successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to assign fee plan in bulk');
    },
  });
};

// --- Payments Hooks ---
export const usePayments = (params?: Record<string, any>) =>
  useQuery({
    queryKey: ['payments', params],
    queryFn: () => feesService.getPayments(params),
  });

export const useRecordPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => feesService.recordPayment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['studentFees'] });
      qc.invalidateQueries({ queryKey: ['feeDashboardStats'] });
      toast.success('Payment recorded successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    },
  });
};

export const useAdjustPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => feesService.adjustPayment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['studentFees'] });
      qc.invalidateQueries({ queryKey: ['feeDashboardStats'] });
      toast.success('Payment adjusted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to adjust payment');
    },
  });
};

// --- Receipts Hooks ---
export const useReceipts = (params?: Record<string, any>) =>
  useQuery({
    queryKey: ['receipts', params],
    queryFn: () => feesService.getReceipts(params),
  });

export const useReceipt = (id: string) =>
  useQuery({
    queryKey: ['receipt', id],
    queryFn: () => feesService.getReceipt(id),
    enabled: !!id,
  });

export const useGenerateReceipt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => feesService.generateReceipt(paymentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['receipts'] });
      toast.success('Receipt generated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate receipt');
    },
  });
};

// --- Discounts Hooks ---
export const useApplyDiscount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => feesService.applyDiscount(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studentFees'] });
      qc.invalidateQueries({ queryKey: ['studentFee'] });
      toast.success('Discount applied successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to apply discount');
    },
  });
};

export const useRemoveDiscount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => feesService.removeDiscount(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studentFees'] });
      qc.invalidateQueries({ queryKey: ['studentFee'] });
      toast.success('Discount removed successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove discount');
    },
  });
};

// --- Refunds Hooks ---
export const useRefunds = (params?: Record<string, any>) =>
  useQuery({
    queryKey: ['refunds', params],
    queryFn: () => feesService.getRefunds(params),
  });

export const useCreateRefund = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => feesService.createRefund(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['refunds'] });
      toast.success('Refund request created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create refund request');
    },
  });
};

export const useUpdateRefundStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      feesService.updateRefundStatus(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['refunds'] });
      qc.invalidateQueries({ queryKey: ['studentFees'] });
      qc.invalidateQueries({ queryKey: ['feeDashboardStats'] });
      toast.success('Refund status updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update refund status');
    },
  });
};

// --- Dashboard Hooks ---
export const useFeeDashboardStats = () =>
  useQuery({
    queryKey: ['feeDashboardStats'],
    queryFn: () => feesService.getDashboardStats(),
  });

export const useFeeMonthlyRevenue = (year?: number) =>
  useQuery({
    queryKey: ['feeMonthlyRevenue', year],
    queryFn: () => feesService.getMonthlyRevenue(year),
  });

export const useFeeBatchRevenue = (academicYear?: string) =>
  useQuery({
    queryKey: ['feeBatchRevenue', academicYear],
    queryFn: () => feesService.getBatchRevenue(academicYear),
  });

export const useFeeCollectionTrend = (days?: number) =>
  useQuery({
    queryKey: ['feeCollectionTrend', days],
    queryFn: () => feesService.getCollectionTrend(days),
  });

export const useFeeOutstandingTrend = () =>
  useQuery({
    queryKey: ['feeOutstandingTrend'],
    queryFn: () => feesService.getOutstandingTrend(),
  });

// --- Reports Hooks ---
export const useDailyCollectionReport = (params?: Record<string, any>) =>
  useQuery({
    queryKey: ['dailyCollectionReport', params],
    queryFn: () => feesService.getDailyCollectionReport(params),
  });

export const useMonthlyCollectionReport = (params?: Record<string, any>) =>
  useQuery({
    queryKey: ['monthlyCollectionReport', params],
    queryFn: () => feesService.getMonthlyCollectionReport(params),
  });

export const useStudentLedgerReport = (studentId: string) =>
  useQuery({
    queryKey: ['studentLedgerReport', studentId],
    queryFn: () => feesService.getStudentLedgerReport(studentId),
    enabled: !!studentId,
  });

export const useBatchRevenueReport = (batchId: string, params?: Record<string, any>) =>
  useQuery({
    queryKey: ['batchRevenueReport', batchId, params],
    queryFn: () => feesService.getBatchRevenueReport(batchId, params),
    enabled: !!batchId,
  });

export const useOutstandingReport = (params?: Record<string, any>) =>
  useQuery({
    queryKey: ['outstandingReport', params],
    queryFn: () => feesService.getOutstandingReport(params),
  });

export const useParentLedgerReport = () =>
  useQuery({
    queryKey: ['parentLedgerReport'],
    queryFn: () => feesService.getParentLedgerReport(),
  });
