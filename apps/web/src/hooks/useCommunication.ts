import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationService, CreateTicketPayload, ReplyTicketPayload } from '@/services/communication.service';
import { TicketStatus } from '@prime/shared-types';

export function useMyTickets(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['tickets', 'my', params],
    queryFn: () => communicationService.getMyTickets(params),
  });
}

export function useAllTickets(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['tickets', 'all', params],
    queryFn: () => communicationService.getAllTickets(params),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => communicationService.getTicketDetail(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTicketPayload) => communicationService.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'all'] });
    },
  });
}

export function useReplyToTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReplyTicketPayload }) => 
      communicationService.replyToTicket(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'all'] });
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) => 
      communicationService.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'all'] });
    },
  });
}

export function useAssignTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assigneeId }: { id: string; assigneeId: string }) => 
      communicationService.assignTicket(id, assigneeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'all'] });
    },
  });
}
