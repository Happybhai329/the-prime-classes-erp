import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export const useAdminDashboard = () =>
  useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: dashboardService.getAdminDashboard,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

export const useStudentGrowthChart = () =>
  useQuery({
    queryKey: ['dashboard', 'charts', 'student-growth'],
    queryFn: dashboardService.getStudentGrowth,
    staleTime: 5 * 60 * 1000,
  });

export const useAttendanceTrendsChart = () =>
  useQuery({
    queryKey: ['dashboard', 'charts', 'attendance-trends'],
    queryFn: dashboardService.getAttendanceTrends,
    staleTime: 5 * 60 * 1000,
  });

export const useFeeTrendsChart = () =>
  useQuery({
    queryKey: ['dashboard', 'charts', 'fee-trends'],
    queryFn: dashboardService.getFeeTrends,
    staleTime: 5 * 60 * 1000,
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
