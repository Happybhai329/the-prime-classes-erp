import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noticesService, CreateNoticePayload } from '@/services/notices.service';

export function useNotices(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['notices', params],
    queryFn: () => noticesService.findAll(params),
  });
}

export function useMyNotices(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['notices', 'my', params],
    queryFn: () => noticesService.getMyNotices(params),
  });
}

export function useNotice(id: string) {
  return useQuery({
    queryKey: ['notices', id],
    queryFn: () => noticesService.findOne(id),
    enabled: !!id,
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNoticePayload) => noticesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateNoticePayload> & { isPublished?: boolean } }) => 
      noticesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['notices', variables.id] });
    },
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => noticesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
}

export function useMarkNoticeRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => noticesService.markRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['notices', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['notices', id] });
    },
  });
}
