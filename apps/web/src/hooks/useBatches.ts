import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { batchService } from '@/services/batch.service';

export const useBatches = (params: Record<string, any>) =>
  useQuery({
    queryKey: ['batches', params],
    queryFn: () => batchService.getAll(params),
    placeholderData: (prev) => prev,
  });

export const useBatch = (id: string) =>
  useQuery({
    queryKey: ['batches', id],
    queryFn: () => batchService.getOne(id),
    enabled: !!id,
  });

export const useCreateBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => batchService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Batch created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to create batch');
    },
  });
};

export const useUpdateBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      batchService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Batch updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update batch');
    },
  });
};

export const useDeleteBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => batchService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Batch deactivated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to deactivate batch');
    },
  });
};

export const useAddStudentsToBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, studentIds }: { batchId: string; studentIds: string[] }) =>
      batchService.addStudents(batchId, studentIds),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['batches'] });
      toast.success(data.message || 'Students added');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to add students');
    },
  });
};

export const useTransferStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, studentId, targetBatchId }: { batchId: string; studentId: string; targetBatchId: string }) =>
      batchService.transferStudent(batchId, { studentId, targetBatchId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Student transferred successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to transfer student');
    },
  });
};
