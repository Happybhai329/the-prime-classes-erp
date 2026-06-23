import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle, Clock, CalendarDays, ArrowRight } from 'lucide-react';
import { useAttendanceDashboard } from '@/hooks/useAttendance';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const AttendanceDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useAttendanceDashboard();

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;

  return (
    <div id="attendance-dashboard">
      <PageHeader
        title="Attendance Dashboard"
        description="Today's attendance overview and weekly trends"
        actions={
          <button onClick={() => navigate('/attendance/mark')} className="btn-primary gap-2">
            <CheckCircle className="h-4 w-4" />
            Mark Attendance
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students Present"
          value={data?.todayPresentCount || 0}
          icon={Users}
          iconClassName="text-primary-600 bg-primary-50"
        />
        <StatCard
          title="Overall Attendance %"
          value={`${data?.todayPercentage || 0}%`}
          icon={CheckCircle}
          iconClassName="text-success-600 bg-success-50"
        />
        <StatCard
          title="Batches Covered"
          value={data?.todayBatchesCovered || 0}
          icon={CalendarDays}
          iconClassName="text-accent-600 bg-accent-50"
        />
        <StatCard
          title="Sessions Today"
          value={data?.todaySessions || 0}
          icon={Clock}
          iconClassName="text-warning-600 bg-warning-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Today's Batch Coverage</h3>
          <div className="space-y-4">
            {(data?.batchWiseSummary || []).map((batch: any) => (
              <div key={batch.batchId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <h4 className="font-medium text-gray-900">{batch.batchName}</h4>
                  <p className="text-sm text-gray-500">
                    Status: {batch.markedToday ? 'Marked' : 'Pending'}
                  </p>
                </div>
                {batch.markedToday ? (
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{batch.todayPercentage}%</span>
                    <p className="text-xs text-success-600">Present today</p>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(`/attendance/mark?batchId=${batch.batchId}`)}
                    className="btn-secondary btn-sm gap-1"
                  >
                    Mark Now <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
            {(!data?.batchWiseSummary || data.batchWiseSummary.length === 0) && (
              <p className="text-gray-500 text-center py-4">No active batches found.</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Trend</h3>
          <div className="space-y-4">
            {(data?.weeklyTrend || []).map((day: any) => (
              <div key={day.date} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        day.percentage >= 80 ? 'bg-success-500' : day.percentage >= 60 ? 'bg-warning-500' : 'bg-danger-500'
                      }`}
                      style={{ width: `${day.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-10 text-right">
                    {day.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
