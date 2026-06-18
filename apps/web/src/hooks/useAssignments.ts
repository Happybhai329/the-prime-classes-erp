import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsService, CreateAssignmentPayload } from '@/services/assignments.service';

export function useAssignments(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['assignments', params],
    queryFn: async () => {
      const res = await assignmentsService.findAll(params);
      return res.data;
    },
  });
}

export function useAssignmentDetails(id: string) {
  return useQuery({
    queryKey: ['assignment', id],
    queryFn: async () => {
      const res = await assignmentsService.findOne(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAssignmentPayload) => assignmentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAssignmentPayload> }) =>
      assignmentsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assignmentsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}

export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => assignmentsService.submit(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}

export function useGradeAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, studentId, score, feedback }: { id: string; studentId: string; score: number; feedback?: string }) =>
      assignmentsService.grade(id, studentId, { score, feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}
