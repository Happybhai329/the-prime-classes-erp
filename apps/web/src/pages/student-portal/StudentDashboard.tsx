import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/auth.store';
import { useAssignments } from '@/hooks/useAssignments';
import { useStudentPerformance } from '@/hooks/useReports';
import { useNotices } from '@/hooks/useNotices';
import { useOnlineTests } from '@/hooks/useOnlineTests';
import { BookOpen, Calendar, ClipboardList, Clock, Award, Bell, CheckCircle2, IndianRupee, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const studentId = user?.student?.id;

  // Queries
  const { data: performance, isLoading: perfLoading } = useStudentPerformance(studentId || '');
  const { data: homeworkData, isLoading: hwLoading } = useAssignments({ type: 'HOMEWORK' });
  const { data: assignmentData, isLoading: asgLoading } = useAssignments({ type: 'ASSIGNMENT' });
  const { data: noticesData, isLoading: noticesLoading } = useNotices();
  const { data: testsData, isLoading: testsLoading } = useOnlineTests();

  if (perfLoading || hwLoading || asgLoading || noticesLoading || testsLoading) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  // Attendance metrics
  const attendancePercentage = performance?.attendance?.percentage ?? 0;
  const attendancePresent = performance?.attendance?.present ?? 0;
  const attendanceTotal = performance?.attendance?.totalDays ?? 0;

  // Homework metrics
  const homeworks = homeworkData?.data || [];
  const pendingHomework = homeworks.filter((hw: any) => hw.submissionStatus === 'Pending' || hw.submissionStatus === 'Late');

  // Assignment metrics
  const assignments = assignmentData?.data || [];
  const pendingAssignments = assignments.filter((asg: any) => asg.submissionStatus === 'Pending' || asg.submissionStatus === 'Late');

  // Upcoming homework & assignments due soon
  const allUpcoming = [...homeworks, ...assignments]
    .filter((a: any) => a.submissionStatus === 'Pending' || a.submissionStatus === 'Late')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  // Recent test performance from profile or query
  const testSubmissions = performance?.tests?.records ?? [];

  // Recent announcements/notices
  const notices = noticesData?.data || [];

  return (
    <div id="student-dashboard" className="space-y-6 animate-slide-up">
      <PageHeader
        title={`Welcome back, ${user?.student?.firstName || 'Student'}!`}
        description={`Class Roll No: ${user?.student?.rollNumber || 'N/A'} · Track your academic performance, pending tasks, and fee statuses.`}
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance KPI */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl p-5 shadow-md flex justify-between items-center relative overflow-hidden">
          <div>
            <p className="text-sm font-medium text-white/80">Attendance Rate</p>
            <p className="text-3xl font-bold mt-1">{attendancePercentage}%</p>
            <p className="text-xs text-white/70 mt-1">{attendancePresent} of {attendanceTotal} days present</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
        </div>

        {/* Pending Homework KPI */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-5 shadow-md flex justify-between items-center relative overflow-hidden">
          <div>
            <p className="text-sm font-medium text-white/80">Pending Homework</p>
            <p className="text-3xl font-bold mt-1">{pendingHomework.length}</p>
            <Link to="/homework" className="text-xs text-white/70 hover:text-white underline mt-1 block">View Homework</Link>
          </div>
          <div className="w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
        </div>

        {/* Pending Assignments KPI */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-5 shadow-md flex justify-between items-center relative overflow-hidden">
          <div>
            <p className="text-sm font-medium text-white/80">Pending Assignments</p>
            <p className="text-3xl font-bold mt-1">{pendingAssignments.length}</p>
            <Link to="/assignments" className="text-xs text-white/70 hover:text-white underline mt-1 block">View Assignments</Link>
          </div>
          <div className="w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
        </div>

        {/* Fee Status KPI */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-5 shadow-md flex justify-between items-center relative overflow-hidden">
          <div>
            <p className="text-sm font-medium text-white/80">Fee Schedule Status</p>
            <p className="text-2xl font-bold mt-1">Clear</p>
            <p className="text-xs text-white/70 mt-1">No outstanding invoices</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center">
            <IndianRupee className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tasks Due Soon & Test Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Work */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" /> Pending Work Due Soon
            </h3>
            {allUpcoming.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {allUpcoming.map((item: any) => {
                  const isHw = item.type === 'HOMEWORK';
                  const path = isHw ? '/homework' : '/assignments';

                  return (
                    <div key={item.id} className="py-3.5 flex justify-between items-center gap-4">
                      <div>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${
                          isHw ? 'text-amber-700 bg-amber-50' : 'text-indigo-700 bg-indigo-50'
                        }`}>
                          {isHw ? 'Homework' : 'Assignment'}
                        </span>
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Subject: {item.subject?.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-red-500 font-medium">
                          Due {new Date(item.deadline).toLocaleDateString()}
                        </span>
                        <Link
                          to={path}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition"
                        >
                          Submit
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-gray-800">All caught up!</p>
                <p className="text-xs text-gray-400">No pending homework or assignments due.</p>
              </div>
            )}
          </div>

          {/* Test Performance */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-500" /> Recent Test Performance
            </h3>
            {testSubmissions.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {testSubmissions.map((record: any) => (
                  <div key={record.testId} className="py-3.5 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{record.testName}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Date: {new Date(record.testDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{record.marksObtained} / {record.totalMarks}</p>
                      <p className="text-xs text-emerald-600 font-semibold">{record.percentage}% ({record.grade})</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">No published tests yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Notices & Notifications */}
        <div className="space-y-6">
          {/* Notices Board */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary-500" /> Notices & Announcements
            </h3>
            {notices.length > 0 ? (
              <div className="space-y-4">
                {notices.slice(0, 5).map((notice: any) => (
                  <div key={notice.id} className="p-3 bg-gray-50/50 hover:bg-gray-50 rounded-xl border border-gray-100 transition space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-primary-600 uppercase">{notice.category || 'Announcement'}</span>
                      <span className="text-[9px] text-gray-400">{new Date(notice.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-gray-800 text-xs line-clamp-1">{notice.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{notice.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-8">No notices or announcements.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
