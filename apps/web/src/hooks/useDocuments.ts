import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsService, UploadDocumentPayload } from '@/services/documents.service';

export function useDocuments(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentsService.findAll(params),
  });
}

export function useMyDocuments(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['documents', 'my', params],
    queryFn: () => documentsService.getMyDocuments(params),
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UploadDocumentPayload) => documentsService.upload(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: (id: string) => documentsService.getDownloadUrl(id),
    // Callers will use the returned URL to trigger the download or open in a new tab
  });
}
