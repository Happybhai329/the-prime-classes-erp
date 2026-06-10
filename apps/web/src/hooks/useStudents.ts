import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { studentService } from '@/services/student.service';

export const useStudents = (params: Record<string, any>) =>
  useQuery({
    queryKey: ['students', params],
    queryFn: () => studentService.getAll(params),
    placeholderData: (prev) => prev,
  });

export const useStudent = (id: string) =>
  useQuery({
    queryKey: ['students', id],
    queryFn: () => studentService.getOne(id),
    enabled: !!id,
  });

export const useCreateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => studentService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to create student');
    },
  });
};

export const useUpdateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      studentService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update student');
    },
  });
};

export const useDeleteStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to delete student');
    },
  });
};

export const useStudentAttendance = (id: string) =>
  useQuery({
    queryKey: ['students', id, 'attendance'],
    queryFn: () => studentService.getAttendanceSummary(id),
    enabled: !!id,
  });

export const useStudentTests = (id: string) =>
  useQuery({
    queryKey: ['students', id, 'tests'],
    queryFn: () => studentService.getTestSummary(id),
    enabled: !!id,
  });

export const useStudentFees = (id: string) =>
  useQuery({
    queryKey: ['students', id, 'fees'],
    queryFn: () => studentService.getFeeSummary(id),
    enabled: !!id,
  });
