import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/auth.store';
import { useStudentPerformance } from '@/hooks/useReports';
import { useStudents } from '@/hooks/useStudents';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { BarChart3, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export const StudentAnalyticsPage: React.FC = () => {
  const { user } = useAuthStore();
  const isStudent = user?.role === 'STUDENT';
  const isAdminOrFaculty = ['ADMIN', 'SUPER_ADMIN', 'FACULTY'].includes(user?.role || '');

  const [selectedStudentId, setSelectedStudentId] = useState(isStudent ? user?.student?.id || '' : '');

  // Queries
  const { data: studentsData } = useStudents(isAdminOrFaculty ? { limit: 100 } : {});
  const students = studentsData?.data || [];

  const { data: profile, isLoading } = useStudentPerformance(selectedStudentId);

  // Colors mapping for charts
  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div id="student-analytics-page" className="space-y-6">
      <PageHeader
        title="Student Insights & Performance Analytics"
        description="Visualize academic performance progress, attendance stability, and subject level comparisons."
      />

      {isAdminOrFaculty && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-400 uppercase">Select Student:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl focus:outline-none text-sm text-gray-600 bg-white max-w-xs"
          >
            <option value="">-- Choose Student --</option>
            {students.map((st: any) => (
              <option key={st.id} value={st.id}>{st.firstName} {st.lastName} (Roll: {st.rollNumber})</option>
            ))}
          </select>
        </div>
      )}

      {selectedStudentId ? (
        isLoading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : profile ? (
          <div className="space-y-6">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center font-bold">
                  📊
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Attendance Rate</p>
                  <h4 className="text-xl font-bold text-gray-900">{profile.attendance?.percentage || 0}%</h4>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center font-bold">
                  📈
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Avg Test Score</p>
                  <h4 className="text-xl font-bold text-gray-900">{Math.round(profile.tests?.averagePercentage || 0)}%</h4>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center font-bold">
                  📝
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Tests Taken</p>
                  <h4 className="text-xl font-bold text-gray-900">{profile.tests?.totalTests || 0}</h4>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center font-bold">
                  🏅
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Best Rank achieved</p>
                  <h4 className="text-xl font-bold text-gray-900">{profile.tests?.bestRank || '—'}</h4>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart: Performance progress */}
              <div className="bg-white p-5 border border-gray-100 shadow-sm rounded-2xl">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-amber-500" /> Academic Marks Progression
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={profile.marksProgress || []} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="testName" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} />
                      <Line type="monotone" dataKey="percentage" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 6 }} name="Scored %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart: Subjectwise Averages */}
              <div className="bg-white p-5 border border-gray-100 shadow-sm rounded-2xl">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4.5 w-4.5 text-primary-500" /> Subject Averages Breakdown
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profile.tests?.subjectStrengths || []} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="subject" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} />
                      <Bar dataKey="avgPercentage" radius={[10, 10, 0, 0]} name="Average %">
                        {profile.tests?.subjectStrengths?.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Attendance Trend Bar Chart */}
              <div className="bg-white p-5 border border-gray-100 shadow-sm rounded-2xl lg:col-span-2">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-blue-500" /> Monthly Attendance Stability
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profile.attendance?.monthlyTrend || []} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} />
                      <Bar dataKey="percentage" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Attendance %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400">
            Failed to parse student data. Please ensure the student has completed test scores.
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-gray-200">
          <AlertCircle className="h-10 w-10 text-gray-300 mb-3" />
          <h4 className="font-semibold text-gray-700">No student selected</h4>
          <p className="text-sm text-gray-400 mt-1">Please pick a student from the filter box above to view their visual analytics metrics.</p>
        </div>
      )}
    </div>
  );
};
