import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { testService } from '@/services/test.service';
import { CreateTestRequest, UpdateTestRequest, BulkMarkEntryRequest } from '@prime/shared-types';

export const testKeys = {
  all: ['tests'] as const,
  lists: () => [...testKeys.all, 'list'] as const,
  list: (params: any) => [...testKeys.lists(), params] as const,
  details: () => [...testKeys.all, 'detail'] as const,
  detail: (id: string) => [...testKeys.details(), id] as const,
  meritLists: () => [...testKeys.all, 'merit-list'] as const,
  meritList: (id: string) => [...testKeys.meritLists(), id] as const,
  subjectAnalysis: (id: string) => [...testKeys.all, 'subject-analysis', id] as const,
};

export function useTestList(params?: any) {
  return useQuery({
    queryKey: testKeys.list(params),
    queryFn: () => testService.getTests(params),
  });
}

export function useTest(id: string) {
  return useQuery({
    queryKey: testKeys.detail(id),
    queryFn: () => testService.getTest(id),
    enabled: !!id,
  });
}

export function useCreateTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTestRequest) => testService.createTest(data),
    onSuccess: () => {
      toast.success('Test created successfully');
      queryClient.invalidateQueries({ queryKey: testKeys.lists() });
    },
  });
}

export function useUpdateTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTestRequest }) => testService.updateTest(id, data),
    onSuccess: (_, { id }) => {
      toast.success('Test updated successfully');
      queryClient.invalidateQueries({ queryKey: testKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: testKeys.lists() });
    },
  });
}

export function useDeleteTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => testService.deleteTest(id),
    onSuccess: () => {
      toast.success('Test deleted successfully');
      queryClient.invalidateQueries({ queryKey: testKeys.lists() });
    },
  });
}

export function useEnterMarks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BulkMarkEntryRequest }) => testService.enterMarks(id, data),
    onSuccess: (_, { id }) => {
      toast.success('Marks updated successfully');
      queryClient.invalidateQueries({ queryKey: testKeys.detail(id) });
    },
  });
}

export function useComputeRankings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => testService.computeRankings(id),
    onSuccess: (data: any, id) => {
      toast.success(data.message || 'Rankings computed successfully');
      queryClient.invalidateQueries({ queryKey: testKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: testKeys.meritList(id) });
    },
  });
}

export function usePublishTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => testService.publish(id),
    onSuccess: (_, id) => {
      toast.success('Test results published successfully');
      queryClient.invalidateQueries({ queryKey: testKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: testKeys.lists() });
    },
  });
}

export function useMeritList(id: string) {
  return useQuery({
    queryKey: testKeys.meritList(id),
    queryFn: () => testService.getMeritList(id),
    enabled: !!id,
  });
}

export function useSubjectAnalysis(id: string) {
  return useQuery({
    queryKey: testKeys.subjectAnalysis(id),
    queryFn: () => testService.getSubjectAnalysis(id),
    enabled: !!id,
  });
}
