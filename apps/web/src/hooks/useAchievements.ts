import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { achievementsService } from '@/services/achievements.service';

export function useOwnXPProfile() {
  return useQuery({
    queryKey: ['achievements', 'profile', 'own'],
    queryFn: async () => {
      const res = await achievementsService.getOwnProfile();
      return res.data;
    },
  });
}

export function useStudentXPProfile(studentId: string) {
  return useQuery({
    queryKey: ['achievements', 'profile', studentId],
    queryFn: async () => {
      const res = await achievementsService.getStudentProfile(studentId);
      return res.data;
    },
    enabled: !!studentId,
  });
}

export function useLeaderboard(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['leaderboard', params],
    queryFn: async () => {
      const res = await achievementsService.getLeaderboard(params);
      return res.data;
    },
  });
}

export function useGrantBadge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, badgeName, description }: { studentId: string; badgeName: string; description: string }) =>
      achievementsService.grantBadge(studentId, badgeName, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['achievements', 'profile', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

export function useCheckMilestones() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => achievementsService.checkMilestones(studentId),
    onSuccess: (_, studentId) => {
      queryClient.invalidateQueries({ queryKey: ['achievements', 'profile', studentId] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}
