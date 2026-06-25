import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import {
  GraduationCap,
  Layers,
  UserCog,
  CalendarCheck,
  IndianRupee,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAdminDashboard, useStudentGrowthChart, useAttendanceTrendsChart, useFeeTrendsChart } from '@/hooks/useDashboard';
import { useAdminIntelligence } from '@/hooks/useAnalytics';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';

/* ---- Stat Card ---- */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  trend?: { value: number; label: string };
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, gradient, trend }) => (
  <div className={`relative overflow-hidden rounded-xl p-5 text-white ${gradient} shadow-lg`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-white/80">{label}</p>
        <p className="text-3xl font-display font-bold mt-1">{value}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend.value >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-300" />
            )}
            <span className="text-xs text-white/70">{trend.label}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/15">
        {icon}
      </div>
    </div>
    {/* Decorative circle */}
    <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
  </div>
);

/* ---- Chart Wrapper ---- */
const ChartCard: React.FC<{ title: string; children: React.ReactNode; isLoading?: boolean }> = ({
  title, children, isLoading,
}) => (
  <div className="card p-5">
    <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
    {isLoading ? <LoadingSpinner size="md" className="h-[240px]" /> : children}
  </div>
);

/* ---- Main Dashboard Page ---- */
export const DashboardPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'PARENT') {
      navigate('/parent-portal', { replace: true });
    } else if (user?.role === 'STUDENT') {
      navigate('/student-portal', { replace: true });
    }
  }, [user, navigate]);

  const isAdminOrStaff = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'FACULTY' || user?.role === 'ACCOUNTANT';

  const { data: dashboard, isLoading } = useAdminDashboard(!!isAdminOrStaff);
  const { data: growthData, isLoading: growthLoading } = useStudentGrowthChart(!!isAdminOrStaff);
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendanceTrendsChart(!!isAdminOrStaff);
  const { data: feeData, isLoading: feeLoading } = useFeeTrendsChart(!!isAdminOrStaff);
  
  // Phase 7 intelligence query
  const { data: adminIntel, isLoading: intelLoading } = useAdminIntelligence(!!isAdminOrStaff);

  if (!isAdminOrStaff) {
    return <LoadingSpinner size="lg" className="h-96" />;
  }

  if (isLoading || intelLoading) {
    return <LoadingSpinner size="lg" className="h-96" />;
  }

  const stats = dashboard?.stats;
  const capacityAnalysis = adminIntel?.capacityAnalysis || [];
  const enrollmentForecast = adminIntel?.enrollmentForecast || [];
  const revenueTrends = adminIntel?.revenueTrends || [];

  return (
    <div className="space-y-6 animate-slide-up" id="dashboard-page">
      <PageHeader
        title="Institute Intelligence Dashboard"
        description="Core ERP metrics paired with explainable AI projections and capacity forecasts."
      />

      {/* Capacity Warning Alert */}
      {capacityAnalysis.some((c: any) => c.status === 'CRITICAL' || c.status === 'WARNING') && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900 text-sm">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Batch Capacity Alerts:</span>
            <div className="mt-1 space-y-1">
              {capacityAnalysis
                .filter((c: any) => c.status === 'CRITICAL' || c.status === 'WARNING')
                .map((c: any) => (
                  <p key={c.batchId}>
                    Batch <span className="font-semibold">{c.batchName} ({c.batchCode})</span> is at <span className="font-bold text-red-600">{c.utilizationRate}%</span> capacity ({c.currentStrength}/{c.maxStrength} students). Consider opening a parallel batch.
                  </p>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Students"
          value={stats?.totalStudents || 0}
          icon={<GraduationCap className="h-6 w-6" />}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
        />
        <StatCard
          label="Active Batches"
          value={stats?.activeBatches || 0}
          icon={<Layers className="h-6 w-6" />}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
        />
        <StatCard
          label="Faculty"
          value={stats?.totalFaculty || 0}
          icon={<UserCog className="h-6 w-6" />}
          gradient="bg-gradient-to-br from-purple-500 to-purple-700"
        />
        <StatCard
          label="Attendance Today"
          value={`${stats?.todayAttendancePercentage || 0}%`}
          icon={<CalendarCheck className="h-6 w-6" />}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
        />
        <StatCard
          label="Fees This Month"
          value={`₹${((stats?.feesCollectedThisMonth || 0) / 1000).toFixed(1)}K`}
          icon={<IndianRupee className="h-6 w-6" />}
          gradient="bg-gradient-to-br from-pink-500 to-rose-600"
        />
        <StatCard
          label="Upcoming Tests"
          value={dashboard?.upcomingTests?.length || 0}
          icon={<ClipboardList className="h-6 w-6" />}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
        />
      </div>

      {/* Projections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Enrollment growth + projection */}
        <ChartCard title="Admissions Growth & 3-Month Projection" isLoading={growthLoading}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={enrollmentForecast.length > 0 ? enrollmentForecast : growthData || []}>
              <defs>
                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a56db" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1a56db" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Area type="monotone" dataKey="count" stroke="#1a56db" fill="url(#gradBlue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Attendance trends */}
        <ChartCard title="Attendance Trends (30 Days)" isLoading={attendanceLoading}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={attendanceData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickFormatter={(d) => new Date(d).getDate().toString()}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Line type="monotone" dataKey="percentage" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue forecast chart */}
        <ChartCard title="Revenue History & Forecast Projections" isLoading={feeLoading}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueTrends.length > 0 ? revenueTrends : feeData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Bar dataKey="actual" fill="#1a56db" radius={[4, 4, 0, 0]} name="Actual Collections" />
              <Bar dataKey="forecast" fill="#ec4899" radius={[4, 4, 0, 0]} name="AI Forecast Projection" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Recent Admissions */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Recent Admissions</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {(dashboard?.recentAdmissions || []).slice(0, 5).map((student: any) => (
              <div key={student.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{student.rollNumber} · {student.classStudying}</p>
                </div>
                <StatusBadge status={student.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tests */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Upcoming Tests</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {(dashboard?.upcomingTests || []).map((test: any) => (
              <div key={test.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{test.name}</p>
                  <p className="text-xs text-gray-500">
                    {test.batchName} · {new Date(test.testDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <StatusBadge status={test.status} />
              </div>
            ))}
            {(!dashboard?.upcomingTests || dashboard.upcomingTests.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-8">No upcoming tests</p>
            )}
          </div>
        </div>

        {/* Batch capacity utilization */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Batch Enrollment Capacity</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {capacityAnalysis.slice(0, 5).map((cap: any) => (
              <div key={cap.batchId} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{cap.batchName}</p>
                  <p className="text-xs text-gray-500">{cap.currentStrength} of {cap.maxStrength} Students</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    cap.status === 'CRITICAL' ? 'bg-red-50 text-red-700' : cap.status === 'WARNING' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {cap.utilizationRate}%
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
