import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/report.service';

export const reportKeys = {
  all: ['reports'] as const,
  attendanceSummary: () => [...reportKeys.all, 'attendance-summary'] as const,
  testsSummary: () => [...reportKeys.all, 'tests-summary'] as const,
  instituteMeritList: () => [...reportKeys.all, 'institute-merit-list'] as const,
  batchMeritList: (batchId: string) => [...reportKeys.all, 'batch-merit-list', batchId] as const,
  examMeritList: (examType: string) => [...reportKeys.all, 'exam-merit-list', examType] as const,
  studentPerformance: (studentId: string) => [...reportKeys.all, 'student-performance', studentId] as const,
  parentDashboard: () => [...reportKeys.all, 'parent-dashboard'] as const,
  academicOverview: () => [...reportKeys.all, 'academic-overview'] as const,
};

export function useAttendanceSummary() {
  return useQuery({
    queryKey: reportKeys.attendanceSummary(),
    queryFn: () => reportService.getAttendanceSummary(),
  });
}

export function useTestsSummary() {
  return useQuery({
    queryKey: reportKeys.testsSummary(),
    queryFn: () => reportService.getTestsSummary(),
  });
}

export function useInstituteMeritList() {
  return useQuery({
    queryKey: reportKeys.instituteMeritList(),
    queryFn: () => reportService.getInstituteMeritList(),
  });
}

export function useBatchMeritList(batchId: string) {
  return useQuery({
    queryKey: reportKeys.batchMeritList(batchId),
    queryFn: () => reportService.getBatchMeritList(batchId),
    enabled: !!batchId,
  });
}

export function useExamMeritList(examType: string) {
  return useQuery({
    queryKey: reportKeys.examMeritList(examType),
    queryFn: () => reportService.getExamMeritList(examType),
    enabled: !!examType,
  });
}

export function useStudentPerformance(studentId: string) {
  return useQuery({
    queryKey: reportKeys.studentPerformance(studentId),
    queryFn: () => reportService.getStudentPerformanceProfile(studentId),
    enabled: !!studentId,
  });
}

export function useParentDashboard() {
  return useQuery({
    queryKey: reportKeys.parentDashboard(),
    queryFn: () => reportService.getParentChildrenData(),
  });
}

export function useAcademicOverview() {
  return useQuery({
    queryKey: reportKeys.academicOverview(),
    queryFn: () => reportService.getAcademicOverview(),
  });
}
