import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onlineTestsService, CreateOnlineTestPayload, AutoGenerateTestPayload } from '@/services/online-tests.service';

export function useOnlineTests(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['online-tests', params],
    queryFn: async () => {
      const res = await onlineTestsService.findAll(params);
      return res.data;
    },
  });
}

export function useOnlineTestDetails(id: string) {
  return useQuery({
    queryKey: ['online-test', id],
    queryFn: async () => {
      const res = await onlineTestsService.findOne(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateOnlineTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOnlineTestPayload) => onlineTestsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-tests'] });
    },
  });
}

export function useAutoGenerateTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AutoGenerateTestPayload) => onlineTestsService.autoGenerate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-tests'] });
    },
  });
}

export function useUpdateOnlineTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateOnlineTestPayload> }) =>
      onlineTestsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-tests'] });
      queryClient.invalidateQueries({ queryKey: ['online-test'] });
    },
  });
}

export function useDeleteOnlineTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => onlineTestsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-tests'] });
    },
  });
}

export function useStartAttempt() {
  return useMutation({
    mutationFn: (testId: string) => onlineTestsService.startAttempt(testId),
  });
}

export function useSaveAttemptState() {
  return useMutation({
    mutationFn: ({ attemptId, resumeState }: { attemptId: string; resumeState: any }) =>
      onlineTestsService.saveState(attemptId, resumeState),
  });
}

export function useSubmitAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attemptId, responses }: { attemptId: string; responses: any[] }) =>
      onlineTestsService.submitAttempt(attemptId, responses),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-tests'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
}
