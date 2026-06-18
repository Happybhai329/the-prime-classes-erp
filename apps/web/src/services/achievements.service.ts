import api from '@/lib/api';

export const achievementsService = {
  getOwnProfile: async () => {
    return api.get('/achievements/profile');
  },

  getStudentProfile: async (studentId: string) => {
    return api.get(`/achievements/profile/${studentId}`);
  },

  getLeaderboard: async (params?: Record<string, any>) => {
    return api.get('/achievements/leaderboard', { params });
  },

  grantBadge: async (studentId: string, badgeName: string, description: string) => {
    return api.post(`/achievements/student/${studentId}/badge`, { badgeName, description });
  },

  checkMilestones: async (studentId: string) => {
    return api.post(`/achievements/student/${studentId}/check`);
  },
};
