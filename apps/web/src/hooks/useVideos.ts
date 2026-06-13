import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videosService, CreateVideoPayload } from '@/services/videos.service';

export function useVideos(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['videos', params],
    queryFn: async () => {
      const res = await videosService.findAll(params);
      return res.data;
    },
  });
}

export function useVideoDetails(id: string) {
  return useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      const res = await videosService.findOne(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVideoPayload) => videosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => videosService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}
