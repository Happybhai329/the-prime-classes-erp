import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { facultyService } from '@/services/facultyService';

export const useFacultyList = (params: Record<string, any>) =>
  useQuery({
    queryKey: ['faculty', params],
    queryFn: () => facultyService.getAll(params),
    placeholderData: (prev) => prev,
  });

export const useFacultyMember = (id: string) =>
  useQuery({
    queryKey: ['faculty', id],
    queryFn: () => facultyService.getOne(id),
    enabled: !!id,
  });

export const useCreateFaculty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => facultyService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faculty'] });
      toast.success('Faculty member created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to create faculty');
    },
  });
};

export const useUpdateFaculty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      facultyService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['faculty'] });
      qc.invalidateQueries({ queryKey: ['faculty', id] });
      toast.success('Faculty profile updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update faculty');
    },
  });
};

export const useDeleteFaculty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => facultyService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faculty'] });
      toast.success('Faculty member deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to delete faculty');
    },
  });
};

export const useAssignFacultyBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, batchId, subjectId }: { id: string; batchId: string; subjectId: string }) =>
      facultyService.assignToBatch(id, batchId, subjectId),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['faculty', id] });
      toast.success('Batch assignment updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to assign batch');
    },
  });
};

export const useRemoveFacultyBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, batchSubjectId }: { id: string; batchSubjectId: string }) =>
      facultyService.removeFromBatch(id, batchSubjectId),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['faculty', id] });
      toast.success('Batch assignment removed successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to remove batch assignment');
    },
  });
};
