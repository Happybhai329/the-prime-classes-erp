import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { subjectService } from '@/services/subjectService';

export const useSubjects = (params?: Record<string, any>) =>
  useQuery({
    queryKey: ['subjects', params],
    queryFn: () => subjectService.getAll(params),
    placeholderData: (prev) => prev,
  });

export const useSubject = (id: string) =>
  useQuery({
    queryKey: ['subjects', id],
    queryFn: () => subjectService.getOne(id),
    enabled: !!id,
  });

export const useCreateSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => subjectService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to create subject');
    },
  });
};

export const useUpdateSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      subjectService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      qc.invalidateQueries({ queryKey: ['subjects', id] });
      toast.success('Subject updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update subject');
    },
  });
};

export const useDeleteSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subjectService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to delete subject');
    },
  });
};
