import React, { useState } from 'react';
import {
  Users,
  Target,
  BadgeAlert,
  ArrowUpRight,
  TrendingUp,
  Search,
  Filter,
  Briefcase,
  PieChart as PieIcon,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  Funnel, FunnelChart, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LabelList
} from 'recharts';

// Mock data matching the Phase 9 analytics spec
const funnelData = [
  { value: 1200, name: 'Inquiry', fill: '#6366f1' },
  { value: 850, name: 'Counseling', fill: '#8b5cf6' },
  { value: 500, name: 'Document Collection', fill: '#ec4899' },
  { value: 320, name: 'Fee Payment', fill: '#f43f5e' },
  { value: 250, name: 'Confirmed', fill: '#10b981' },
];

const sourceData = [
  { name: 'Website Forms', value: 450, color: '#3b82f6' },
  { name: 'Google Ads', value: 300, color: '#10b981' },
  { name: 'Facebook Ads', value: 250, color: '#ec4899' },
  { name: 'WhatsApp Campaigns', value: 150, color: '#f59e0b' },
  { name: 'Manual Entry', value: 50, color: '#8b5cf6' },
];

const campaignRoiData = [
  { name: 'Sainik Admission 2026', spend: 12000, revenue: 45000, roi: 275 },
  { name: 'Scholarship Drive Jan', spend: 8000, revenue: 32000, roi: 300 },
  { name: 'RIMC Entrance Drive', spend: 15000, revenue: 38000, roi: 153 },
];

const recentLeadsMock = [
  { id: '1', name: 'Kabir Dev', email: 'kabir@gmail.com', phone: '9876543201', source: 'Website Forms', status: 'Counseling', score: 85, counselor: 'Shalini Sharma' },
  { id: '2', name: 'Simran Kaur', email: 'simran@yahoo.com', phone: '9876543202', source: 'Google Ads', status: 'Fee Payment', score: 92, counselor: 'Rajesh Nair' },
  { id: '3', name: 'Aryan Goel', email: 'aryan@hotmail.com', phone: '9876543203', source: 'Facebook Ads', status: 'Inquiry', score: 45, counselor: 'Shalini Sharma' },
  { id: '4', name: 'Mira Sen', email: 'mira@outlook.com', phone: '9876543204', source: 'WhatsApp Campaigns', status: 'Document Collection', score: 78, counselor: 'Unassigned' },
];

export const CrmDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  return (
    <div className="space-y-6 animate-slide-up p-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 tracking-tight">CRM Intelligence Dashboard</h1>
          <p className="text-sm text-gray-500">Track acquisition funnels, counselor performance, event signups, and automated campaign ROIs.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary flex items-center gap-2 text-xs py-2">
            <Calendar className="h-4 w-4" /> Last 30 Days
          </button>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-xl p-5 shadow-lg relative overflow-hidden">
          <p className="text-xs text-indigo-200 uppercase font-semibold tracking-wider">Leads Generated</p>
          <p className="text-3xl font-extrabold mt-1">1,200</p>
          <div className="flex items-center gap-1 mt-2 text-indigo-200 text-xs">
            <TrendingUp className="h-4 w-4 text-emerald-300" />
            <span className="font-medium text-emerald-300">+12%</span> vs last month
          </div>
          <Users className="absolute -bottom-2 -right-2 h-16 w-16 text-indigo-500/20" />
        </div>

        <div className="bg-gradient-to-br from-violet-600 to-violet-800 text-white rounded-xl p-5 shadow-lg relative overflow-hidden">
          <p className="text-xs text-violet-200 uppercase font-semibold tracking-wider">Conversion Rate</p>
          <p className="text-3xl font-extrabold mt-1">20.8%</p>
          <div className="flex items-center gap-1 mt-2 text-violet-200 text-xs">
            <TrendingUp className="h-4 w-4 text-emerald-300" />
            <span className="font-medium text-emerald-300">+3.1%</span> vs industry avg
          </div>
          <Target className="absolute -bottom-2 -right-2 h-16 w-16 text-violet-500/20" />
        </div>

        <div className="bg-gradient-to-br from-pink-600 to-pink-800 text-white rounded-xl p-5 shadow-lg relative overflow-hidden">
          <p className="text-xs text-pink-200 uppercase font-semibold tracking-wider">Active Counselors</p>
          <p className="text-3xl font-extrabold mt-1">8</p>
          <div className="flex items-center gap-1 mt-2 text-pink-200 text-xs">
            <Briefcase className="h-4 w-4 text-pink-300" /> Avg workload: 78 leads
          </div>
          <Layers className="absolute -bottom-2 -right-2 h-16 w-16 text-pink-500/20" />
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-xl p-5 shadow-lg relative overflow-hidden">
          <p className="text-xs text-emerald-200 uppercase font-semibold tracking-wider">Revenue Forecast</p>
          <p className="text-3xl font-extrabold mt-1">₹4.2L</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-200 text-xs">
            <ArrowUpRight className="h-4 w-4 text-emerald-300" /> Projected enrollment: 95%
          </div>
          <BadgeAlert className="absolute -bottom-2 -right-2 h-16 w-16 text-emerald-500/20" />
        </div>
      </div>

      {/* Chart Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Funnel Analysis */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-500" /> Conversion Funnel Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Funnel data={funnelData} dataKey="value" nameKey="name">
                    <LabelList position="right" fill="#1e293b" stroke="none" dataKey="name" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 pl-4 border-l border-gray-100">
              <p className="text-xs text-gray-400">STAGE RETENTIONS</p>
              {funnelData.map((item, idx) => (
                <div key={item.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="font-medium text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value} ({idx === 0 ? '100%' : `${Math.round((item.value / funnelData[0].value) * 100)}%`})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lead Source breakdown */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-violet-500" /> Leads by Acquisition Source
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-gray-600">
            {sourceData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span>{s.name}: <strong className="text-gray-900">{s.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign Performance Metrics */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-pink-500" /> Active Marketing Campaigns & ROI
        </h3>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={campaignRoiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="spend" fill="#f43f5e" name="Budget Spent (₹)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue Earned (₹)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leads Management List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-gray-900">Leads Tracking Console</h3>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email..."
                className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-600">
              <Filter className="h-3.5 w-3.5" />
              <select
                className="bg-transparent focus:outline-none cursor-pointer text-xs"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Stages</option>
                <option value="Inquiry">Inquiry</option>
                <option value="Counseling">Counseling</option>
                <option value="Document Collection">Document Collection</option>
                <option value="Fee Payment">Fee Payment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Lead Name</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">AI Conversion Probability</th>
                <th className="px-6 py-3">Status Stage</th>
                <th className="px-6 py-3">Assigned Counselor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
              {recentLeadsMock
                .filter((lead) => statusFilter === 'ALL' || lead.status === statusFilter)
                .filter((lead) => lead.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{lead.name}</td>
                    <td className="px-6 py-4">
                      <div>{lead.email}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-medium">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              lead.score >= 80
                                ? 'bg-emerald-500'
                                : lead.score >= 50
                                ? 'bg-indigo-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                        <span className="font-bold">{lead.score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        lead.status === 'Fee Payment'
                          ? 'bg-emerald-50 text-emerald-700'
                          : lead.status === 'Counseling'
                          ? 'bg-indigo-50 text-indigo-700'
                          : lead.status === 'Document Collection'
                          ? 'bg-pink-50 text-pink-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600">{lead.counselor}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
