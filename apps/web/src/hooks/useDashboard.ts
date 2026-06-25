import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export const useAdminDashboard = (enabled = true) =>
  useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: dashboardService.getAdminDashboard,
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled,
  });

export const useStudentGrowthChart = (enabled = true) =>
  useQuery({
    queryKey: ['dashboard', 'charts', 'student-growth'],
    queryFn: dashboardService.getStudentGrowth,
    staleTime: 5 * 60 * 1000,
    enabled,
  });

export const useAttendanceTrendsChart = (enabled = true) =>
  useQuery({
    queryKey: ['dashboard', 'charts', 'attendance-trends'],
    queryFn: dashboardService.getAttendanceTrends,
    staleTime: 5 * 60 * 1000,
    enabled,
  });

export const useFeeTrendsChart = (enabled = true) =>
  useQuery({
    queryKey: ['dashboard', 'charts', 'fee-trends'],
    queryFn: dashboardService.getFeeTrends,
    staleTime: 5 * 60 * 1000,
    enabled,
  });

export const useParentDashboard = () =>
  useQuery({
    queryKey: ['dashboard', 'parent'],
    queryFn: dashboardService.getParentDashboard,
    staleTime: 2 * 60 * 1000,
  });

export const useChildAnalytics = (studentId: string) =>
  useQuery({
    queryKey: ['dashboard', 'parent', 'child', studentId],
    queryFn: () => dashboardService.getChildAnalytics(studentId),
    staleTime: 5 * 60 * 1000,
    enabled: !!studentId,
  });
