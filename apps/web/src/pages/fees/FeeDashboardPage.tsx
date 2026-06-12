import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  DollarSign,
  Users,
  CreditCard,
  Percent,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  useFeeDashboardStats,
  useFeeMonthlyRevenue,
  useFeeBatchRevenue,
} from '@/hooks/useFees';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const FeeDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useFeeDashboardStats();
  const { data: monthlyRevenue, isLoading: monthlyLoading } = useFeeMonthlyRevenue();
  const { data: batchRevenue, isLoading: batchLoading } = useFeeBatchRevenue();

  if (statsLoading || monthlyLoading || batchLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const formattedStats = stats || {
    revenueThisMonth: 0,
    revenueThisYear: 0,
    pendingFees: 0,
    overdueAmount: 0,
    collectionRate: 0,
    refundAmount: 0,
    totalStudentsWithFees: 0,
    studentsFullyPaid: 0,
  };

  const menuItems = [
    {
      title: 'Fee Plans',
      description: 'Define academic fee plans and structures.',
      icon: Calendar,
      path: '/fees/plans',
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Student Fees',
      description: 'Assign fee plans to students and view outstanding dues.',
      icon: Users,
      path: '/fees/student-fees',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Payments',
      description: 'Record student payments and view transaction history.',
      icon: CreditCard,
      path: '/fees/payments',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Receipts',
      description: 'Verify digital payment receipts with QR support.',
      icon: FileText,
      path: '/fees/receipts',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Refunds & Adjustments',
      description: 'Manage refund requests and sibling discounts.',
      icon: Percent,
      path: '/fees/refunds',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Fee Reports',
      description: 'Generate daily/monthly ledgers and outstanding lists.',
      icon: TrendingUp,
      path: '/fees/reports',
      color: 'bg-rose-50 text-rose-600',
    },
  ];

  return (
    <div id="fee-dashboard-page" className="space-y-6">
      <PageHeader
        title="Fee & Revenue Dashboard"
        description="Comprehensive oversight of institute collections, outstanding balances, and financial health."
      />

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center p-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition shadow-sm text-center"
            >
              <div className={`p-3 rounded-xl ${item.color} mb-3`}>
                <Icon className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-sm text-gray-900">{item.title}</h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
            </button>
          );
        })}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenue (This Month)"
          value={`₹${formattedStats.revenueThisMonth.toLocaleString()}`}
          icon={IndianRupee}
          iconClassName="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          title="Collection Rate"
          value={`${formattedStats.collectionRate}%`}
          icon={Percent}
          iconClassName="text-indigo-600 bg-indigo-50"
          trend={{
            value: formattedStats.collectionRate,
            isPositive: formattedStats.collectionRate >= 75,
            label: 'of total assigned fees',
          }}
        />
        <StatCard
          title="Pending Fees"
          value={`₹${formattedStats.pendingFees.toLocaleString()}`}
          icon={TrendingUp}
          iconClassName="text-amber-600 bg-amber-50"
        />
        <StatCard
          title="Overdue Amount"
          value={`₹${formattedStats.overdueAmount.toLocaleString()}`}
          icon={AlertTriangle}
          iconClassName="text-red-600 bg-red-50"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Fully Paid Students</p>
            <h4 className="mt-2 text-2xl font-bold text-gray-900">
              {formattedStats.studentsFullyPaid}
              <span className="text-sm font-normal text-gray-500 ml-1">
                / {formattedStats.totalStudentsWithFees} assigned
              </span>
            </h4>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Revenue (This Year)</p>
            <h4 className="mt-2 text-2xl font-bold text-gray-900">
              ₹{formattedStats.revenueThisYear.toLocaleString()}
            </h4>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Refunded</p>
            <h4 className="mt-2 text-2xl font-bold text-gray-900">
              ₹{formattedStats.refundAmount.toLocaleString()}
            </h4>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Collection Trend</h3>
          <div className="h-80">
            {monthlyRevenue && monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
                  />
                  <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">No chart data available</div>
            )}
          </div>
        </div>

        {/* Batch-wise Collection Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Batch Revenue Analysis</h3>
          <div className="h-80">
            {batchRevenue && batchRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={batchRevenue}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis dataKey="batchName" type="category" width={100} tickLine={false} axisLine={false} style={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip
                    formatter={(value) => `₹${Number(value).toLocaleString()}`}
                    contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
                  />
                  <Legend />
                  <Bar dataKey="collected" name="Collected" fill="#10B981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="outstanding" name="Outstanding" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">No batch revenue data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
