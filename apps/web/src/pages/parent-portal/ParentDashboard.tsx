import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useParentDashboard } from '@/hooks/useReports';
import { GraduationCap, Calendar, Award, Bell, IndianRupee, BookOpen, ClipboardList, CheckCircle2 } from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { data: dashboardData, isLoading } = useParentDashboard();
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  const children = dashboardData?.children || [];
  const selectedChild = children[selectedChildIndex];

  return (
    <div id="parent-dashboard" className="space-y-6 animate-slide-up">
      <PageHeader
        title="Parent Portal Dashboard"
        description="Track your children's attendance, marks, fees, and academic homework progress."
      />

      {/* Child Selector Tabs */}
      {children.length > 1 && (
        <div className="flex border-b border-gray-200 gap-2">
          {children.map((child: any, idx: number) => (
            <button
              key={child.studentId}
              onClick={() => setSelectedChildIndex(idx)}
              className={`pb-3 text-sm font-semibold border-b-2 px-4 transition ${
                selectedChildIndex === idx
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {child.studentName} ({child.rollNumber})
            </button>
          ))}
        </div>
      )}

      {selectedChild ? (
        <div className="space-y-6">
          {/* Child Summary Profile Header */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary-500" /> {selectedChild.studentName}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Batch: <span className="font-semibold text-gray-700">{selectedChild.batchName}</span> · Roll No: <span className="font-semibold text-gray-700">{selectedChild.rollNumber}</span>
              </p>
            </div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Student Profile Active
            </div>
          </div>

          {/* Child KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Attendance KPI */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{selectedChild.attendancePercentage}%</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>

            {/* Homework Pending KPI */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase">Pending Homework</p>
                <p className="text-2xl font-bold text-amber-500 mt-1">{(selectedChild as any).pendingHomeworkCount || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-amber-500" />
              </div>
            </div>

            {/* Assignments Pending KPI */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase">Pending Assignments</p>
                <p className="text-2xl font-bold text-indigo-500 mt-1">{(selectedChild as any).pendingAssignmentCount || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-indigo-500" />
              </div>
            </div>

            {/* Fees Status KPI */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase">Fee Status</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">Paid</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-emerald-600" />
              </div>
            </div>

            {/* Overall Merit / Average KPI */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase">Test Average</p>
                {selectedChild.recentTests?.length > 0 ? (
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {Math.round(selectedChild.recentTests.reduce((acc: number, t: any) => acc + t.percentage, 0) / selectedChild.recentTests.length)}%
                  </p>
                ) : (
                  <p className="text-xl font-bold text-gray-400 mt-1">No Tests</p>
                )}
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Recent Test Performance */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" /> Recent Test Performance
                </h3>
                {selectedChild.recentTests?.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {selectedChild.recentTests.map((t: any, idx: number) => (
                      <div key={idx} className="py-3 flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">{t.testName}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">Test Date: {t.testDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{t.marksObtained} / {t.totalMarks}</p>
                          <p className="text-xs text-emerald-600 font-semibold">{t.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">No test marks published yet.</p>
                )}
              </div>

              {/* Attendance Trend */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" /> Recent Attendance History
                </h3>
                {selectedChild.attendanceTrend?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {selectedChild.attendanceTrend.map((a: any, idx: number) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl text-center border border-gray-100 space-y-1">
                        <p className="text-[10px] text-gray-400 font-semibold">{a.date}</p>
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          a.status === 'PRESENT' ? 'text-emerald-700 bg-emerald-50' :
                          a.status === 'LATE' ? 'text-yellow-700 bg-yellow-50' : 'text-red-700 bg-red-50'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">No attendance recorded.</p>
                )}
              </div>
            </div>

            {/* Right Col: Notices Board */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary-500" /> Institute Announcements
                </h3>
                {(dashboardData?.recentNotices?.length ?? 0) > 0 ? (
                  <div className="space-y-4">
                    {dashboardData!.recentNotices.map((n: any) => (
                      <div key={n.id} className="p-3 bg-gray-50/50 hover:bg-gray-50 rounded-xl border border-gray-100 transition space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-bold text-primary-600 uppercase">{n.type}</span>
                          <span className="text-[9px] text-gray-400">{new Date(n.date).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-gray-800 text-xs line-clamp-1">{n.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2">{n.body}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">No notices published.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CheckCircle2 className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-800">No children mapped</p>
          <p className="text-xs text-gray-400">Please contact the administrator to link your children's profiles.</p>
        </div>
      )}
    </div>
  );
};
