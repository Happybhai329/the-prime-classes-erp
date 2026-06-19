import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { parentService } from '@/services/parent.service';

export const useParents = (params: Record<string, any>) =>
  useQuery({
    queryKey: ['parents', params],
    queryFn: () => parentService.getAll(params),
    placeholderData: (prev) => prev,
  });

export const useParent = (id: string) =>
  useQuery({
    queryKey: ['parents', id],
    queryFn: () => parentService.getOne(id),
    enabled: !!id,
  });

export const useUpdateParent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      parentService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parents'] });
      toast.success('Parent updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to update parent');
    },
  });
};

export const useCreateParent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => parentService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parents'] });
      toast.success('Parent profile created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to create parent');
    },
  });
};

