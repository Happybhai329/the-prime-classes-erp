import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/auth.store';
import { useLeaderboard, useOwnXPProfile, useGrantBadge, useCheckMilestones } from '@/hooks/useAchievements';
import { useStudents } from '@/hooks/useStudents';
import { Award, Trophy, Zap, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const isStudent = user?.role === 'STUDENT';
  const isAdminOrFaculty = ['ADMIN', 'SUPER_ADMIN', 'FACULTY'].includes(user?.role || '');

  const [isGrantOpen, setIsGrantOpen] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState('');
  const [badgeName, setBadgeName] = useState('');
  const [badgeDesc, setBadgeDesc] = useState('');

  // Queries
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard();
  const { data: studentProfile } = useOwnXPProfile();
  const { data: studentsData } = useStudents(isAdminOrFaculty ? { limit: 100 } : {});
  const studentsList = studentsData?.data || [];

  // Mutations
  const grantBadgeMutation = useGrantBadge();
  const checkMilestonesMutation = useCheckMilestones();

  const handleGrantBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentId || !badgeName || !badgeDesc) {
      toast.error('Required fields are missing');
      return;
    }

    try {
      await grantBadgeMutation.mutateAsync({
        studentId: targetStudentId,
        badgeName,
        description: badgeDesc,
      });
      toast.success(`Badge "${badgeName}" granted successfully!`);
      setIsGrantOpen(false);
      setTargetStudentId('');
      setBadgeName('');
      setBadgeDesc('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to grant badge');
    }
  };

  const handleCheckMilestones = async (studentId: string) => {
    try {
      await checkMilestonesMutation.mutateAsync(studentId);
      toast.success('Milestones audited and updated!');
    } catch {
      toast.error('Milestone evaluation failed');
    }
  };

  if (leaderboardLoading) return <LoadingSpinner size="lg" className="py-20" />;

  const rankings = leaderboard || [];
  
  // Calculate level progression (e.g. 500 XP per level)
  const currentPoints = studentProfile?.points || 0;
  const currentLevel = studentProfile?.level || 1;
  const xpInCurrentLevel = currentPoints % 500;
  const percentProgress = Math.min(100, Math.floor((xpInCurrentLevel / 500) * 100));

  const badgeIcons: Record<string, string> = {
    'Top Performer': '🏆',
    'Perfect Attendance': '📅',
    'Scholar': '🎓',
    'Warrior': '⚔️',
    'Speed Star': '⚡',
  };

  return (
    <div id="leaderboard-page" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Hall of Fame & Gamification"
          description="Track your performance metrics, earn experience points (XP), and collect legendary badges."
        />
        {isAdminOrFaculty && (
          <button
            onClick={() => setIsGrantOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 transition shadow-sm self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Grant Badge
          </button>
        )}
      </div>

      {isStudent && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Level Board */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-md space-y-4 md:col-span-2 relative overflow-hidden group">
            <div className="absolute right-4 top-4 text-9xl opacity-10 group-hover:scale-110 transition duration-300">⚡</div>
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-yellow-300 animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-100">Student Progression</span>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold">Level {currentLevel}</h3>
              <p className="text-xs text-amber-100 mt-1">
                You have accumulated <strong className="text-white">{currentPoints} XP</strong>. Gain {500 - xpInCurrentLevel} more XP to reach Level {currentLevel + 1}!
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span>{xpInCurrentLevel} / 500 XP</span>
                <span>{percentProgress}%</span>
              </div>
              <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden">
                <div className="bg-yellow-300 h-full rounded-full transition-all duration-500" style={{ width: `${percentProgress}%` }} />
              </div>
            </div>
          </div>

          {/* Achievement stats */}
          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Badges</p>
                <h4 className="text-3xl font-extrabold text-gray-900 mt-1">
                  {studentProfile?.achievements?.filter((a: any) => a.achievementType === 'BADGE').length || 0}
                </h4>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                🏆
              </div>
            </div>
            <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
              <span>Auditing status:</span>
              <button
                onClick={() => handleCheckMilestones(user?.student?.id || '')}
                className="text-primary-600 font-bold hover:underline"
              >
                Sync Milestones
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leaderboard rankings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" /> Leaderboard Rankings
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Level</th>
                    <th className="px-6 py-4">Badges</th>
                    <th className="px-6 py-4 text-right">Experience (XP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {rankings.map((stud: any, index: number) => {
                    const rank = index + 1;
                    const isSelf = stud.id === user?.student?.id;

                    return (
                      <tr key={stud.id} className={`transition ${isSelf ? 'bg-primary-50/20' : 'hover:bg-gray-50/30'}`}>
                        <td className="px-6 py-4">
                          {rank === 1 ? (
                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-200">🥇</span>
                          ) : rank === 2 ? (
                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200">🥈</span>
                          ) : rank === 3 ? (
                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-orange-100 text-orange-850 text-xs font-bold border border-orange-200">🥉</span>
                          ) : (
                            <span className="text-gray-400 font-bold pl-2.5">{rank}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{stud.firstName} {stud.lastName}</p>
                          <p className="text-[10px] text-gray-400">Roll: {stud.rollNumber}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                            Lvl {stud.level || 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            {stud.achievements?.filter((a: any) => a.achievementType === 'BADGE').map((badge: any) => (
                              <span
                                key={badge.id}
                                className="cursor-default text-sm"
                                title={badge.badgeName}
                              >
                                {badgeIcons[badge.badgeName] || '🏅'}
                              </span>
                            ))}
                            {stud.achievements?.filter((a: any) => a.achievementType === 'BADGE').length === 0 && (
                              <span className="text-xs text-gray-300 font-medium">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-extrabold text-gray-900">
                          {stud.points} XP
                        </td>
                      </tr>
                    );
                  })}
                  {rankings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-400">
                        Leaderboard empty. Complete mock tests to earn XP!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Student Badges list */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm border-b border-gray-50 pb-3">
              <Award className="h-5 w-5 text-amber-500" />
              {isStudent ? 'Your Badges Cabinet' : 'Automated Badges Registry'}
            </h3>

            {isStudent ? (
              <div className="space-y-3">
                {studentProfile?.achievements?.filter((a: any) => a.achievementType === 'BADGE').map((badge: any) => (
                  <div key={badge.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-start gap-3">
                    <div className="text-2xl pt-0.5 shrink-0">
                      {badgeIcons[badge.badgeName] || '🏅'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-xs">{badge.badgeName}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{badge.description}</p>
                      <p className="text-[9px] text-gray-400 font-semibold mt-1">Earned {new Date(badge.earnedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {(!studentProfile?.achievements || studentProfile.achievements.filter((a: any) => a.achievementType === 'BADGE').length === 0) && (
                  <p className="text-xs text-gray-400 text-center py-6">You haven't unlocked any badges yet.</p>
                )}
              </div>
            ) : (
              // Instructor view list of available badges
              <div className="space-y-3.5 text-xs text-gray-600">
                <div className="flex gap-2">
                  <span className="text-xl">🏆</span>
                  <div>
                    <strong className="text-gray-800 block">Top Performer</strong>
                    <span>100% accuracy on mock test papers.</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-xl">🎓</span>
                  <div>
                    <strong className="text-gray-800 block">Scholar</strong>
                    <span>Scoring passing grades on all batch tests.</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-xl">📅</span>
                  <div>
                    <strong className="text-gray-800 block">Perfect Attendance</strong>
                    <span>Maintaining 100% attendance rate.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grant Badge Modal */}
      {isGrantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Grant Academic Badge</h3>
            <form onSubmit={handleGrantBadge} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Select Student *</label>
                <select
                  value={targetStudentId}
                  required
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                >
                  <option value="">Choose Student</option>
                  {studentsList.map((st: any) => (
                    <option key={st.id} value={st.id}>
                      {st.firstName} {st.lastName} (Roll: {st.rollNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Badge Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Speed Star, Warrior"
                  value={badgeName}
                  onChange={(e) => setBadgeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Description / Achievement Detail *</label>
                <textarea
                  required
                  placeholder="Explain why this student is receiving this badge..."
                  value={badgeDesc}
                  onChange={(e) => setBadgeDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsGrantOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grantBadgeMutation.isPending}
                  className="px-4 py-2 rounded-lg text-sm text-white bg-amber-500 hover:bg-amber-600 transition"
                >
                  {grantBadgeMutation.isPending ? 'Granting...' : 'Grant Badge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
