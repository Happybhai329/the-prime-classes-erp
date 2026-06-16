import React, { useState, useEffect } from 'react';
import { 
  Building2, IndianRupee, Users, 
  MapPin, UserCheck, RefreshCw, Layers
} from 'lucide-react';
import { franchiseService } from '@/services/franchise.service';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Cell
} from 'recharts';
import toast from 'react-hot-toast';

export const HeadOfficeDashboard: React.FC = () => {
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await franchiseService.getFranchiseReport();
      setReport(res);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to aggregate franchise data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <LoaderSpinner className="h-10 w-10 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Aggregating branch metrics...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl shadow-sm">
        <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="font-bold text-gray-800 text-base mb-1">Franchise Data Unreachable</h3>
        <p className="text-xs text-gray-400 max-w-xs mx-auto mb-4">Ensure this institute is registered as a branch in your organization's panel.</p>
        <button onClick={loadData} className="btn-primary py-2 px-4 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-display">
      
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-2xl p-6 border border-emerald-900/40 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-lg">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{report.organizationName} — Head Office Dashboard</h1>
            <p className="text-xs text-slate-400">Consolidated analytics and performance comparisons across all franchise branches.</p>
          </div>
        </div>
        <button onClick={loadData} className="btn bg-slate-800 hover:bg-slate-700 text-white text-xs border border-slate-700 py-2.5 px-4 flex items-center gap-2 rounded-xl self-start transition-all">
          <RefreshCw className="h-4 w-4" /> Sync Franchise Data
        </button>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Users className="h-6 w-6" /></div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Consolidated Students</span>
            <span className="text-2xl font-bold text-gray-900">{report.totalStudents}</span>
            <span className="text-[10px] text-gray-400 block">Across all branches</span>
          </div>
        </div>

        <div className="card bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center"><IndianRupee className="h-6 w-6" /></div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Consolidated Revenue</span>
            <span className="text-2xl font-bold text-gray-900">₹{report.totalRevenue.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-500 font-semibold block">✓ Collected fees</span>
          </div>
        </div>

        <div className="card bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Building2 className="h-6 w-6" /></div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Active Branches</span>
            <span className="text-2xl font-bold text-gray-900">{report.branchPerformance.length}</span>
            <span className="text-[10px] text-gray-400 block">Connected nodes</span>
          </div>
        </div>

        <div className="card bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><UserCheck className="h-6 w-6" /></div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Total Faculty</span>
            <span className="text-2xl font-bold text-gray-900">{report.facultyCount}</span>
            <span className="text-[10px] text-gray-400 block">Educators registry</span>
          </div>
        </div>
      </div>

      {/* Main Grid comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Branch performance comparisons list */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900">Branch Comparisons</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs divide-y divide-gray-100">
              <thead>
                <tr className="text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Branch Details</th>
                  <th className="py-3 px-4">Branch Code</th>
                  <th className="py-3 px-4 text-center">Student Count</th>
                  <th className="py-3 px-4 text-right">Revenue Collection</th>
                  <th className="py-3 px-4 text-center">Active Users</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.branchPerformance.map((bp: any) => (
                  <tr key={bp.branchId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" /> {bp.branchName}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-gray-500">{bp.branchCode}</td>
                    <td className="py-4 px-4 text-center text-gray-800 font-semibold">{bp.studentCount}</td>
                    <td className="py-4 px-4 text-right font-bold text-gray-950">₹{bp.revenue.toLocaleString()}</td>
                    <td className="py-4 px-4 text-center text-gray-600 font-medium">{bp.activeUsersCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic visual charts */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900">Revenue Contribution</h2>
          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.branchPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="branchCode" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {report.branchPerformance.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#14b8a6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Enrollment growth trend line */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900">Franchise Enrollment Growth Trend (Current Session)</h2>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={report.enrollmentTrends}>
              <defs>
                <linearGradient id="colorEnrolled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="studentCount" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEnrolled)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

const LoaderSpinner = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
export default HeadOfficeDashboard;
