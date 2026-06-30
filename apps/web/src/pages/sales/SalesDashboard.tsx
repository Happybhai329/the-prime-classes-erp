import React from 'react';
import { useSalesDashboardStats, useSalesAnalytics } from '@/hooks/useSales';
import { PageHeader } from '@/components/ui/PageHeader';
import { Loader2, ClipboardList, Award, IndianRupee, Percent } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

export const SalesDashboard: React.FC = () => {
  const { data: stats, isLoading: loadingStats } = useSalesDashboardStats();
  const { data: analytics, isLoading: loadingAnalytics } = useSalesAnalytics();

  if (loadingStats || loadingAnalytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary-600 h-8 w-8" />
      </div>
    );
  }

  // Color palette
  const COLORS = ['#1a365d', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const kpis = [
    {
      title: 'Total Enquiries',
      value: stats?.totalEnquiries || 0,
      sub: `${stats?.todaysEnquiries || 0} captured today`,
      icon: ClipboardList,
      color: 'bg-primary-50 text-primary-700 border-primary-200',
    },
    {
      title: 'Admissions',
      value: stats?.totalAdmissions || 0,
      sub: `${stats?.todaysAdmissions || 0} enrolled today`,
      icon: Award,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Revenue Collected',
      value: `₹${(stats?.revenue || 0).toLocaleString()}`,
      sub: 'From registration fees',
      icon: IndianRupee,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Conversion Rate',
      value: `${stats?.conversionRate || 0}%`,
      sub: 'Enquiries to Admissions',
      icon: Percent,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales CRM Dashboard"
        description="Monitor lead pipeline, conversion analytics, and counsellor workload."
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`card border p-5 flex items-start gap-4 rounded-xl bg-white shadow-sm ${kpi.color}`}>
              <div className="p-3 bg-white/80 rounded-lg shadow-sm border border-inherit">
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{kpi.title}</p>
                <h4 className="text-2xl font-bold font-display text-gray-900">{kpi.value}</h4>
                <p className="text-xs text-gray-500 font-medium">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admission Trend Area Chart */}
        <div className="card p-6 bg-white border border-gray-200 rounded-xl shadow-sm lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Admission Trend (Last 6 Months)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.trend || []}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a365d" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1a365d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="count" name="Admissions" stroke="#1a365d" strokeWidth={2} fillOpacity={1} fill="url(#colorTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Pie Chart */}
        <div className="card p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Lead Source Distribution</h3>
          <div className="h-64 flex flex-col justify-between">
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={analytics?.leadSources || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={10} width={90} />
                <Tooltip />
                <Bar dataKey="value" name="Enquiries" radius={[0, 4, 4, 0]}>
                  {(analytics?.leadSources || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Funnel & Counsellor performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="card p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">CRM Conversion Funnel</h3>
          <div className="space-y-4">
            {(analytics?.funnel || []).map((stage: any, idx: number) => {
              // Width decreases as stage goes down the funnel
              const totalEnquiries = analytics.funnel[0].count || 1;
              const percentage = ((stage.count / totalEnquiries) * 100).toFixed(0);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span>{stage.stage}</span>
                    <span>{stage.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-primary-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Counsellor Rankings Table */}
        <div className="card p-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Counsellor Rankings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-semibold">
                  <th className="pb-3">Counsellor</th>
                  <th className="pb-3 text-center">Admissions</th>
                  <th className="pb-3 text-center">Revenue</th>
                  <th className="pb-3 text-right">Conv. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {(analytics?.rankings || []).map((rank: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3 font-medium flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 border border-gray-200">
                        {idx + 1}
                      </span>
                      {rank.name}
                    </td>
                    <td className="py-3 text-center font-semibold">{rank.admissions} / {rank.targetAdmissions}</td>
                    <td className="py-3 text-center text-primary-700 font-semibold">₹{rank.revenue.toLocaleString()}</td>
                    <td className="py-3 text-right font-medium text-emerald-600">{rank.conversionRate}%</td>
                  </tr>
                ))}
                {(analytics?.rankings || []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">No active counsellors found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
