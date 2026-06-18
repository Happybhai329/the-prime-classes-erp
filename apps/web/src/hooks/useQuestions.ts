import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsService, CreateQuestionPayload } from '@/services/questions.service';

export function useQuestions(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['questions', params],
    queryFn: async () => {
      const res = await questionsService.findAll(params);
      return res.data;
    },
  });
}

export function useQuestionBanks(subjectId?: string) {
  return useQuery({
    queryKey: ['question-banks', subjectId],
    queryFn: async () => {
      const res = await questionsService.findBanks(subjectId);
      return res.data;
    },
  });
}

export function useQuestionBankDetails(id: string) {
  return useQuery({
    queryKey: ['question-bank', id],
    queryFn: async () => {
      const res = await questionsService.getBankDetails(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuestionPayload) => questionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateQuestionPayload> }) =>
      questionsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

export function useBulkImportQuestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questions: CreateQuestionPayload[]) => questionsService.bulkImport(questions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

export function useCreateQuestionBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; subjectId: string }) =>
      questionsService.createBank(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-banks'] });
    },
  });
}

export function useAddQuestionsToBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, questionIds }: { id: string; questionIds: string[] }) =>
      questionsService.addQuestionsToBank(id, questionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
    },
  });
}

export function useRemoveQuestionsFromBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, questionIds }: { id: string; questionIds: string[] }) =>
      questionsService.removeQuestionsFromBank(id, questionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
    },
  });
}
