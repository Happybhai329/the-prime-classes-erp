import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialsService, UploadMaterialPayload } from '@/services/materials.service';

export function useMaterials(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['materials', params],
    queryFn: async () => {
      const res = await materialsService.findAll(params);
      return res.data;
    },
  });
}

export function useMaterialCategories() {
  return useQuery({
    queryKey: ['material-categories'],
    queryFn: async () => {
      const res = await materialsService.findCategories();
      return res.data;
    },
  });
}

export function useCreateMaterialCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => materialsService.createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-categories'] });
    },
  });
}

export function useUploadMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UploadMaterialPayload) => materialsService.upload(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UploadMaterialPayload> }) =>
      materialsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => materialsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}

export function useDownloadMaterial() {
  return useMutation({
    mutationFn: (id: string) => materialsService.getDownloadUrl(id),
  });
}

export function usePreviewMaterial() {
  return useMutation({
    mutationFn: (id: string) => materialsService.getPreviewUrl(id),
  });
}

export function useToggleFavoriteMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => materialsService.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}

export function useMaterialAccessLogs(id: string) {
  return useQuery({
    queryKey: ['material-logs', id],
    queryFn: async () => {
      const res = await materialsService.getAccessLogs(id);
      return res.data;
    },
    enabled: !!id,
  });
}
