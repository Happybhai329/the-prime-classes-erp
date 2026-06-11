import React from 'react';
import { useParentDashboard } from '@/hooks/useDashboard';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Calendar, Award, BookOpen, AlertCircle } from 'lucide-react';

export const ParentDashboardPage: React.FC = () => {
  const { data: dashboardData, isLoading } = useParentDashboard();

  if (isLoading || !dashboardData) return <LoadingSpinner size="lg" className="py-20" />;

  return (
    <div id="parent-dashboard-page" className="max-w-6xl mx-auto">
      <PageHeader 
        title="Parent Portal" 
        description="Track your children's academic progress and attendance" 
      />

      {dashboardData.children.length === 0 ? (
        <div className="card p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">No Children Linked</h2>
          <p className="text-gray-500 mt-2">Please contact the administration to link your profile with your children's records.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {dashboardData.children.map((child: any) => (
            <div key={child.studentId} className="card overflow-hidden">
              <div className="bg-gradient-to-r from-primary-700 to-primary-900 p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{child.studentName}</h2>
                  <p className="text-primary-100 opacity-90 mt-1">Roll #: {child.rollNumber} • Batch: {child.batchName}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-primary-200">Overall Attendance</span>
                  <p className="text-3xl font-bold">{child.attendancePercentage}%</p>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent-500" /> Recent Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {child.recentTests.length > 0 ? (
                    child.recentTests.map((test: any, i: any) => (
                      <div key={i} className="border border-gray-100 bg-gray-50 rounded-xl p-4">
                        <p className="text-sm font-medium text-gray-900 truncate" title={test.testName}>{test.testName}</p>
                        <p className="text-xs text-gray-500 mt-1">{test.testDate}</p>
                        <div className="mt-3 flex justify-between items-end">
                          <div>
                            <span className="text-2xl font-bold text-gray-900">{test.percentage}%</span>
                            <span className="text-xs text-gray-500 ml-1">({test.marksObtained}/{test.totalMarks})</span>
                          </div>
                          {test.batchRank && (
                            <span className="badge bg-primary-50 text-primary-700">Rank {test.batchRank}</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-6 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      No test results published yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600" /> Upcoming Tests
              </h3>
              <div className="space-y-3">
                {dashboardData.upcomingTests.length > 0 ? (
                  dashboardData.upcomingTests.map((t: any) => (
                    <div key={t.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-white">
                      <div>
                        <p className="font-medium text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.batchName}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-primary-600">{t.testDate}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No upcoming tests scheduled.</p>
                )}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary-600" /> Recent Notices
              </h3>
              <div className="space-y-3">
                {dashboardData.recentNotices.length > 0 ? (
                  dashboardData.recentNotices.map((n: any) => (
                    <div key={n.id} className="p-3 border border-gray-100 rounded-lg bg-white relative">
                      {!n.isRead && <span className="absolute top-3 right-3 w-2 h-2 bg-primary-500 rounded-full" />}
                      <p className="font-medium text-gray-900 text-sm pr-4">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{n.body}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(n.sentAt).toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recent notices.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
