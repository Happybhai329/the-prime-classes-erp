import React, { useState } from 'react';
import { useAttendanceSummary, useTestsSummary, useInstituteMeritList, useAcademicOverview } from '@/hooks/useReports';
import { PageHeader } from '@/components/ui/PageHeader';
import { TabGroup } from '@/components/ui/TabGroup';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { Users, FileText, Award, BookOpen, TrendingUp, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const tabs = [
  { id: 'summary', label: 'Institute Summary' },
  { id: 'academic', label: 'Academic Overview' },
  { id: 'merit-list', label: 'Institute Merit List' },
];

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('summary');

  const { data: attSummary, isLoading: attLoading } = useAttendanceSummary();
  const { data: testSummary, isLoading: testLoading } = useTestsSummary();
  const { data: meritList, isLoading: meritLoading } = useInstituteMeritList();
  const { data: academicOverview, isLoading: academicLoading } = useAcademicOverview();

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rank === 2) return 'bg-gray-200 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const meritColumns = [
    { key: 'rank', header: 'Inst. Rank', render: (m: any) => <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${getRankColor(m.rank)}`}>{m.rank}</span> },
    { key: 'student', header: 'Student', render: (m: any) => <span className="font-medium text-gray-900">{m.studentName}</span> },
    { key: 'roll', header: 'Roll #', render: (m: any) => m.rollNumber },
    { key: 'batch', header: 'Batch', render: (m: any) => <span className="badge-primary">{m.batchName}</span> },
    { key: 'percentage', header: 'Overall %', render: (m: any) => <span className="font-bold text-gray-900">{m.percentage}%</span> },
    { key: 'grade', header: 'Grade', render: (m: any) => <span className="font-medium text-primary-600">{m.grade}</span> },
  ];

  const engagementColumns = [
    { key: 'student', header: 'Student Name', render: (m: any) => <span className="font-semibold text-gray-900">{m.name}</span> },
    { key: 'roll', header: 'Roll #', render: (m: any) => m.rollNumber },
    { key: 'batch', header: 'Batch', render: (m: any) => <span className="badge-primary">{m.batchName}</span> },
    { key: 'attendance', header: 'Attendance', render: (m: any) => <span>{m.attendancePercentage}%</span> },
    { key: 'submissions', header: 'Submissions', render: (m: any) => <span>{m.submissionsCount} files</span> },
    { key: 'testAvg', header: 'Test Avg', render: (m: any) => <span>{m.testAverage}%</span> },
    { key: 'score', header: 'Engagement Score', render: (m: any) => <span className="font-bold text-primary-600">{m.engagementScore}/100</span> },
  ];

  return (
    <div id="reports-page">
      <PageHeader title="Institute Reports" description="High-level analytics and cross-batch merit lists" />

      <div className="mb-6">
        <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === 'summary' && (
        <div className="space-y-8">
          {(attLoading || testLoading) ? <LoadingSpinner size="lg" className="py-20" /> : (
            <>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Highlights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard title="Present Today" value={`${attSummary?.today?.percentage || 0}%`} icon={Users} trend={{ value: 12, isPositive: true, label: 'vs last week' }} />
                  <StatCard title="This Month Avg" value={`${attSummary?.thisMonth?.percentage || 0}%`} icon={Users} iconClassName="text-accent-600 bg-accent-50" />
                  <StatCard title="Total Students Marked Today" value={attSummary?.today?.totalStudents || 0} icon={FileText} iconClassName="text-gray-600 bg-gray-100" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Academics Highlights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard title="Active/Upcoming Tests" value={testSummary?.activeUpcomingTests || 0} icon={FileText} iconClassName="text-primary-600 bg-primary-50" />
                  <div className="md:col-span-2 card p-6">
                    <h4 className="font-medium text-gray-700 mb-4">Recent Published Results</h4>
                    <div className="space-y-3">
                      {testSummary?.recentResults?.map((r: any) => (
                        <div key={r.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{r.name}</p>
                            <p className="text-xs text-gray-500">{r.batchName} • {r.testDate}</p>
                          </div>
                          <span className="badge-success">Published</span>
                        </div>
                      ))}
                      {(!testSummary?.recentResults || testSummary.recentResults.length === 0) && (
                        <p className="text-sm text-gray-500">No recent results.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'academic' && (
        <div className="space-y-8">
          {academicLoading ? <LoadingSpinner size="lg" className="py-20" /> : (
            <>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Completion Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard title="Homework Completion Rate" value={`${academicOverview?.homework?.completionRate || 0}%`} icon={BookOpen} iconClassName="text-amber-600 bg-amber-50" />
                  <StatCard title="Assignment Completion Rate" value={`${academicOverview?.assignment?.completionRate || 0}%`} icon={CheckCircle} iconClassName="text-primary-600 bg-primary-50" />
                  <StatCard title="Assignment On-Time Rate" value={`${academicOverview?.assignment?.onTimeRate || 0}%`} icon={TrendingUp} iconClassName="text-emerald-600 bg-emerald-50" />
                  <StatCard title="Late Submissions Count" value={academicOverview?.assignment?.lateSubmitted || 0} icon={FileText} iconClassName="text-red-600 bg-red-50" />
                </div>
              </div>

              <div className="card overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary-600" />
                    Student Engagement Rankings
                  </h3>
                  <span className="text-sm text-gray-500">Based on attendance, assignments, and test averages</span>
                </div>
                <DataTable
                  columns={engagementColumns}
                  data={academicOverview?.studentEngagement || []}
                  isLoading={academicLoading}
                  emptyTitle="No engagement data available"
                  emptyDescription="Engagement scores will appear once data starts accumulating."
                />
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'merit-list' && (
        <div className="card overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary-600" />
              Institute Overall Merit List
            </h3>
            <span className="text-sm text-gray-500">Based on all published test results</span>
          </div>
          <DataTable
            columns={meritColumns}
            data={meritList?.items || []}
            isLoading={meritLoading}
            emptyTitle="No data available"
            emptyDescription="Merit lists will appear once test results are published."
          />
        </div>
      )}
    </div>
  );
};
