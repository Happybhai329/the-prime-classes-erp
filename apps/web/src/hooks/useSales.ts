import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '@/services/sales.service';
import { toast } from 'react-hot-toast';

export const useSalesDashboardStats = () => {
  return useQuery({
    queryKey: ['sales', 'dashboard'],
    queryFn: () => salesService.getDashboardStats(),
    refetchInterval: 60000, // refresh every minute
  });
};

export const useEnquiries = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ['enquiries', params],
    queryFn: () => salesService.getEnquiries(params),
    placeholderData: (prev) => prev,
  });
};

export const useEnquiry = (id: string) => {
  return useQuery({
    queryKey: ['enquiries', id],
    queryFn: () => salesService.getEnquiry(id),
    enabled: !!id,
  });
};

export const useCreateEnquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => salesService.createEnquiry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'dashboard'] });
      toast.success('Enquiry captured successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to capture enquiry');
    },
  });
};

export const useUpdateEnquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      salesService.updateEnquiry(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['enquiries', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'dashboard'] });
      toast.success('Enquiry updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update enquiry');
    },
  });
};

export const useDeleteEnquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesService.deleteEnquiry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'dashboard'] });
      toast.success('Enquiry deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to delete enquiry');
    },
  });
};

export const useBulkDeleteEnquiries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => salesService.bulkDeleteEnquiries(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'dashboard'] });
      toast.success('Selected enquiries deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to delete selected enquiries');
    },
  });
};

export const useImportEnquiriesCsv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => salesService.importEnquiriesCsv(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'dashboard'] });
      toast.success(`Successfully imported ${data.importedCount} enquiries`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'CSV Import failed');
    },
  });
};

export const useFollowUps = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ['followups', params],
    queryFn: () => salesService.getFollowUps(params),
    placeholderData: (prev) => prev,
  });
};

export const useDashboardFollowUps = () => {
  return useQuery({
    queryKey: ['followups', 'dashboard'],
    queryFn: () => salesService.getDashboardFollowUps(),
  });
};

export const useFollowUpTimeline = (enquiryId: string) => {
  return useQuery({
    queryKey: ['followups', 'timeline', enquiryId],
    queryFn: () => salesService.getFollowUpTimeline(enquiryId),
    enabled: !!enquiryId,
  });
};

export const useCreateFollowUp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => salesService.createFollowUp(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      queryClient.invalidateQueries({ queryKey: ['followups', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['followups', 'timeline', variables.enquiryId] });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      toast.success('Follow-up logged successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to log follow-up');
    },
  });
};

export const useUpdateFollowUp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      salesService.updateFollowUp(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      queryClient.invalidateQueries({ queryKey: ['followups', 'dashboard'] });
      toast.success('Follow-up updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update follow-up');
    },
  });
};

export const useDeleteFollowUp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesService.deleteFollowUp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      queryClient.invalidateQueries({ queryKey: ['followups', 'dashboard'] });
      toast.success('Follow-up deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to delete follow-up');
    },
  });
};

export const useAdmissions = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ['admissions', params],
    queryFn: () => salesService.getAdmissions(params),
    placeholderData: (prev) => prev,
  });
};

export const useAdmission = (id: string) => {
  return useQuery({
    queryKey: ['admissions', id],
    queryFn: () => salesService.getAdmission(id),
    enabled: !!id,
  });
};

export const useConvertFromEnquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enquiryId: string) => salesService.convertFromEnquiry(enquiryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'dashboard'] });
      toast.success('Converted to Admission successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to convert to admission');
    },
  });
};

export const useUpdateAdmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      salesService.updateAdmission(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['admissions', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'dashboard'] });
      toast.success('Admission updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update admission');
    },
  });
};

export const useEnrollIntoAcademic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      salesService.enrollIntoAcademic(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['students'] }); // invalidate academic student list
      queryClient.invalidateQueries({ queryKey: ['sales', 'dashboard'] });
      toast.success('Student successfully enrolled into Academic ERP');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to enroll student');
    },
  });
};

export const useCounsellors = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['counsellors', params],
    queryFn: () => salesService.getCounsellors(params),
  });
};

export const useCreateCounsellor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => salesService.createCounsellor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counsellors'] });
      toast.success('Counsellor registered successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to register counsellor');
    },
  });
};

export const useUpdateCounsellor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      salesService.updateCounsellor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counsellors'] });
      toast.success('Counsellor updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update counsellor');
    },
  });
};

export const useDeleteCounsellor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesService.deleteCounsellor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counsellors'] });
      toast.success('Counsellor profile deleted');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to delete counsellor');
    },
  });
};

export const useSalesAnalytics = () => {
  return useQuery({
    queryKey: ['sales', 'analytics'],
    queryFn: () => salesService.getAnalytics(),
  });
};

export const useSalesReport = (reportType: string) => {
  return useQuery({
    queryKey: ['sales', 'reports', reportType],
    queryFn: () => salesService.getReport(reportType),
    enabled: !!reportType,
  });
};
