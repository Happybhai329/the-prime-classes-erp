import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import toast from 'react-hot-toast';

export const useStudentPrediction = (studentId: string) =>
  useQuery({
    queryKey: ['analytics', 'student', studentId, 'prediction'],
    queryFn: () => analyticsService.getStudentPrediction(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });

export const useStudentWeakTopics = (studentId: string) =>
  useQuery({
    queryKey: ['analytics', 'student', studentId, 'weak-topics'],
    queryFn: () => analyticsService.getStudentWeakTopics(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });

export const useStudentRecommendations = (studentId: string) =>
  useQuery({
    queryKey: ['analytics', 'student', studentId, 'recommendations'],
    queryFn: () => analyticsService.getStudentRecommendations(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });

export const useBatchPrediction = (batchId: string) =>
  useQuery({
    queryKey: ['analytics', 'batch', batchId, 'prediction'],
    queryFn: () => analyticsService.getBatchPrediction(batchId),
    enabled: !!batchId,
    staleTime: 5 * 60 * 1000,
  });

export const useBatchRiskAlerts = (batchId: string) =>
  useQuery({
    queryKey: ['analytics', 'batch', batchId, 'risk-alerts'],
    queryFn: () => analyticsService.getBatchRiskAlerts(batchId),
    enabled: !!batchId,
    staleTime: 5 * 60 * 1000,
  });

export const useAdminIntelligence = (enabled = true) =>
  useQuery({
    queryKey: ['analytics', 'admin', 'intelligence'],
    queryFn: analyticsService.getAdminIntelligence,
    staleTime: 5 * 60 * 1000,
    enabled,
  });

export const useQuestionAnalytics = () =>
  useQuery({
    queryKey: ['analytics', 'questions'],
    queryFn: analyticsService.getQuestionAnalytics,
    staleTime: 5 * 60 * 1000,
  });

export const useTriggerSync = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: analyticsService.triggerSync,
    onSuccess: () => {
      toast.success('AI Data Snapshots updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Sync failed.');
    },
  });
};
