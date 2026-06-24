import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarEventsService, CreateCalendarEventPayload } from '@/services/calendar-events.service';

export function useCalendarEvents(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['calendar-events', params],
    queryFn: async () => {
      const res = await calendarEventsService.findAll(params);
      return res.data;
    },
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCalendarEventPayload) => calendarEventsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarEventsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}
