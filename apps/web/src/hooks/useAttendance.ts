import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { attendanceService } from '@/services/attendance.service';
import { CreateAttendanceSessionRequest, BulkAttendanceRequest } from '@prime/shared-types';

export const attendanceKeys = {
  all: ['attendance'] as const,
  sessions: (params?: any) => [...attendanceKeys.all, 'sessions', params] as const,
  session: (id: string) => [...attendanceKeys.all, 'session', id] as const,
  dashboard: () => [...attendanceKeys.all, 'dashboard'] as const,
  reports: (type: string, params?: any) => [...attendanceKeys.all, 'reports', type, params] as const,
  analytics: (params?: any) => [...attendanceKeys.all, 'analytics', params] as const,
};

export function useAttendanceSessions(params?: any) {
  return useQuery({
    queryKey: attendanceKeys.sessions(params),
    queryFn: () => attendanceService.getSessions(params),
  });
}

export function useAttendanceSession(id: string) {
  return useQuery({
    queryKey: attendanceKeys.session(id),
    queryFn: () => attendanceService.getSession(id),
    enabled: !!id,
  });
}

export function useAttendanceDashboard() {
  return useQuery({
    queryKey: attendanceKeys.dashboard(),
    queryFn: () => attendanceService.getDashboard(),
  });
}

export function useCreateAttendanceSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAttendanceSessionRequest) => attendanceService.createSession(data),
    onSuccess: () => {
      toast.success('Attendance session created');
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

export function useCreateBulkAttendanceSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkAttendanceRequest) => attendanceService.createBulkSessions(data),
    onSuccess: (data: any) => {
      toast.success(`Marked attendance for ${data.count} batches`);
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

export function useUpdateAttendanceSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => attendanceService.updateSession(id, data),
    onSuccess: (_, { id }) => {
      toast.success('Attendance updated');
      queryClient.invalidateQueries({ queryKey: attendanceKeys.session(id) });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.sessions() });
    },
  });
}

export function useFinalizeAttendanceSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attendanceService.finalizeSession(id),
    onSuccess: (_, id) => {
      toast.success('Attendance session finalized');
      queryClient.invalidateQueries({ queryKey: attendanceKeys.session(id) });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.sessions() });
    },
  });
}

export function useAttendanceReport(type: 'daily' | 'monthly' | 'student' | 'batch', id?: string, params?: any) {
  return useQuery({
    queryKey: attendanceKeys.reports(type, { id, ...params }),
    queryFn: () => {
      if (type === 'daily') return attendanceService.getDailyReport(params);
      if (type === 'monthly') return attendanceService.getMonthlyReport(params);
      if (type === 'student' && id) return attendanceService.getStudentReport(id, params);
      if (type === 'batch' && id) return attendanceService.getBatchReport(id, params);
      throw new Error('Invalid report type or missing ID');
    },
    enabled: type === 'daily' || type === 'monthly' || !!id,
  });
}

export function useAttendanceAnalytics(params?: any) {
  return useQuery({
    queryKey: attendanceKeys.analytics(params),
    queryFn: () => attendanceService.getAnalytics(params),
  });
}
