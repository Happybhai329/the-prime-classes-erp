import React, { useState, useEffect } from 'react';
import { 
  Building2, IndianRupee, CreditCard, LifeBuoy, BarChart3, Shield, 
  X, Send, HardDrive, RefreshCw, Globe
} from 'lucide-react';
import { superAdminService } from '@/services/super-admin.service';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Cell
} from 'recharts';
import toast from 'react-hot-toast';

export const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'institutes' | 'plans' | 'revenue' | 'support' | 'usage'>('institutes');
  const [tenants, setTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any>({ mrr: 0, totalRevenue: 0, chartData: [], invoices: [] });
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected states for modals
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [ticketResponse, setTicketResponse] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  
  // Modal toggles
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [tenantsRes, plansRes, revenueRes, ticketsRes] = await Promise.all([
        superAdminService.getTenants(),
        superAdminService.getPlans(),
        superAdminService.getRevenueStats(),
        superAdminService.getTickets(),
      ]);
      setTenants(tenantsRes);
      setPlans(plansRes);
      setRevenueData(revenueRes);
      setTickets(ticketsRes);
    } catch (err: any) {
      toast.error('Failed to load Super Admin metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleToggleTenant = async (id: string, currentStatus: boolean) => {
    try {
      const targetStatus = !currentStatus;
      await superAdminService.toggleTenantStatus(id, targetStatus);
      toast.success(`Tenant ${targetStatus ? 'activated' : 'suspended'} successfully`);
      setTenants(tenants.map(t => t.id === id ? { ...t, isActive: targetStatus } : t));
    } catch (err: any) {
      toast.error('Failed to update tenant status');
    }
  };

  const handleUpgradePlanSubmit = async () => {
    if (!selectedTenant || !selectedPlanId) return;
    try {
      await superAdminService.upgradePlan(selectedTenant.id, selectedPlanId);
      toast.success(`Plan updated successfully for ${selectedTenant.name}`);
      setShowUpgradeModal(false);
      loadAllData(); // reload stats
    } catch (err: any) {
      toast.error('Failed to upgrade tenant plan');
    }
  };

  const handleTicketRespondSubmit = async () => {
    if (!selectedTicket || !ticketResponse.trim()) return;
    try {
      await superAdminService.respondToTicket(selectedTicket.id, ticketResponse);
      toast.success('Response sent and ticket resolved');
      setShowTicketModal(false);
      setTicketResponse('');
      loadAllData();
    } catch (err: any) {
      toast.error('Failed to respond to support ticket');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <LoaderSpinner className="h-10 w-10 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Aggregating SaaS statistics...</p>
        </div>
      </div>
    );
  }

  // Dashboard Stats Header
  const activeTenantsCount = tenants.filter(t => t.isActive).length;
  const totalStorageBytes = tenants.reduce((sum, t) => sum + (t.storageUsageBytes || 0), 0);
  const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-6 font-display">
      
      {/* SaaS Dashboard Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 rounded-2xl p-6 border border-slate-700/40 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-lg">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">SaaS Super Admin Control Room</h1>
            <p className="text-xs text-slate-400">Manage institutes, handle subscriptions, monitor storage, and view SaaS billing analytics.</p>
          </div>
        </div>
        <button onClick={loadAllData} className="btn bg-slate-800 hover:bg-slate-700 text-white text-xs border border-slate-700 py-2.5 px-4 flex items-center gap-2 rounded-xl self-start transition-all">
          <RefreshCw className="h-4 w-4" /> Sync Stats
        </button>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Building2 className="h-6 w-6" /></div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Total Institutes</span>
            <span className="text-2xl font-bold text-gray-900">{tenants.length}</span>
            <span className="text-[10px] text-emerald-500 font-medium block">✓ {activeTenantsCount} active</span>
          </div>
        </div>

        <div className="card bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><IndianRupee className="h-6 w-6" /></div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">MRR (Recurring)</span>
            <span className="text-2xl font-bold text-gray-900">₹{revenueData.mrr.toLocaleString()}</span>
            <span className="text-[10px] text-gray-400 block">SaaS subscriptions</span>
          </div>
        </div>

        <div className="card bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><HardDrive className="h-6 w-6" /></div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Global Storage</span>
            <span className="text-2xl font-bold text-gray-900">{totalStorageMB} MB</span>
            <span className="text-[10px] text-gray-400 block">LMS & Documents</span>
          </div>
        </div>

        <div className="card bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><LifeBuoy className="h-6 w-6" /></div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Open Tickets</span>
            <span className="text-2xl font-bold text-gray-900">{tickets.filter(t => t.status === 'OPEN').length}</span>
            <span className="text-[10px] text-orange-500 block">Requires attention</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200 gap-1 bg-gray-100/60 p-1 rounded-xl self-start max-w-fit">
        {[
          { id: 'institutes', label: 'Institutes', icon: Building2 },
          { id: 'plans', label: 'Plans & Features', icon: CreditCard },
          { id: 'revenue', label: 'Billing & MRR', icon: IndianRupee },
          { id: 'support', label: 'Support Queue', icon: LifeBuoy },
          { id: 'usage', label: 'Usage Monitor', icon: BarChart3 },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === t.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Body */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm min-h-[400px]">
        
        {/* TAB 1: INSTITUTES */}
        {activeTab === 'institutes' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 mb-2">Registered Institutes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Institute Details</th>
                    <th className="py-3 px-4">Workspace / Domain</th>
                    <th className="py-3 px-4">Current Plan</th>
                    <th className="py-3 px-4 text-center">Active Users</th>
                    <th className="py-3 px-4 text-center">Storage Used</th>
                    <th className="py-3 px-4 text-center">Health Score</th>
                    <th className="py-3 px-4 text-center">Tenant State</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 font-semibold text-gray-900">
                        <div>{t.name}</div>
                        <span className="text-[10px] text-gray-400 font-normal">Registered {new Date(t.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-mono text-[11px] text-gray-600">{t.slug}.primeclasses.in</div>
                        {t.customDomain ? (
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-blue-600">
                            <Globe className="h-3 w-3" /> {t.customDomain}
                            {t.domainVerified && <span className="text-[9px] bg-blue-50 text-blue-700 px-1 rounded">SSL Verified</span>}
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400">No custom domain</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full font-bold text-[10px] ${
                          t.plan === 'FRANCHISE' ? 'bg-emerald-50 text-emerald-700' :
                          t.plan === 'ENTERPRISE' ? 'bg-purple-50 text-purple-700' :
                          t.plan === 'PROFESSIONAL' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-700'
                        }`}>
                          {t.plan}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-700 font-medium">{t.activeUsers}</td>
                      <td className="py-4 px-4 text-center text-gray-500 font-medium">{(t.storageUsageBytes / (1024 * 1024)).toFixed(2)} MB</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full font-extrabold ${
                          t.healthScore >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          t.healthScore >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {t.healthScore}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {t.isActive ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTenant(t);
                            setSelectedPlanId(plans.find(p => p.name.toUpperCase() === t.plan.toUpperCase())?.id || '');
                            setShowUpgradeModal(true);
                          }}
                          className="btn-secondary text-[11px] py-1.5 px-3 rounded-lg border border-gray-200 hover:border-amber-500 transition-all font-semibold"
                        >
                          Modify Plan
                        </button>
                        <button
                          onClick={() => handleToggleTenant(t.id, t.isActive)}
                          className={`btn font-bold py-1.5 px-3 rounded-lg text-[11px] border text-white transition-all ${
                            t.isActive 
                              ? 'bg-rose-500 hover:bg-rose-600 border-rose-600'
                              : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600'
                          }`}
                        >
                          {t.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PLANS & FEATURES */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-gray-900 mb-2">SaaS Plan Offerings & Feature Flags</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {plans.map((p) => (
                <div key={p.id} className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-slate-50/50 relative">
                  <div className="mb-4">
                    <h3 className="font-bold text-base text-gray-900">{p.name}</h3>
                    <div className="flex items-baseline gap-1 my-2">
                      <span className="text-2xl font-extrabold text-slate-800">₹{p.price}</span>
                      <span className="text-xs text-gray-500">/ {p.billingCycle.toLowerCase()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{p.description || 'Flexible platform features package.'}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Feature Access</div>
                    <ul className="space-y-2 text-xs">
                      {Object.entries(p.featureFlags).map(([key, enabled]) => (
                        <li key={key} className="flex items-center justify-between">
                          <span className="text-gray-600">{key.replace('_', ' ')}</span>
                          {enabled ? (
                            <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-[10px] font-bold">×</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REVENUE */}
        {activeTab === 'revenue' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Area */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-bold text-gray-900">SaaS Monthly Revenue Growth</h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData.chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Invoices List */}
              <div className="pt-4 space-y-3">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400">SaaS Billing History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-gray-100">
                    <thead>
                      <tr className="text-gray-400 font-semibold">
                        <th className="py-2">Invoice #</th>
                        <th className="py-2">Tenant</th>
                        <th className="py-2 text-right">Amount</th>
                        <th className="py-2 text-center">Status</th>
                        <th className="py-2">Due Date</th>
                        <th className="py-2">Payment Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {revenueData.invoices.map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50">
                          <td className="py-3 font-mono text-[11px] font-semibold text-gray-700">{inv.invoiceNumber}</td>
                          <td className="py-3 font-medium text-gray-900">{inv.tenantName}</td>
                          <td className="py-3 text-right font-semibold text-gray-950">₹{inv.amount.toLocaleString()}</td>
                          <td className="py-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                          <td className="py-3 text-gray-500">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Billing Aggregations Panel */}
            <div className="space-y-6 bg-slate-50/60 p-5 rounded-2xl border border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-400 mb-4">Financial Aggregation</h2>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-gray-400">ARR Forecast (Annual)</span>
                  <div className="text-2xl font-bold text-gray-950 mt-1">₹{(revenueData.mrr * 12).toLocaleString()}</div>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Based on active MRR</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Total Collected Revenue</span>
                  <div className="text-2xl font-bold text-gray-950 mt-1">₹{revenueData.totalRevenue.toLocaleString()}</div>
                  <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">100% renewal success</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Churn Rate</span>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">0.0%</div>
                  <span className="text-[10px] text-gray-400 block mt-0.5">No cancelled institutes</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: SUPPORT */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 mb-2">Cross-Tenant Support Queue</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs divide-y divide-gray-100">
                <thead>
                  <tr className="text-gray-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Support Ticket</th>
                    <th className="py-3 px-4">Institute</th>
                    <th className="py-3 px-4">Sender Email</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Created At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tickets.map((tk) => (
                    <tr key={tk.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 font-semibold text-gray-900">
                        <div>{tk.subject}</div>
                        <span className="text-[10px] text-gray-400 font-normal">{tk.category} Support</span>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{tk.tenant?.name || 'SaaS Global'}</td>
                      <td className="py-4 px-4 font-medium text-gray-600">{tk.creator?.email || '—'}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tk.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' :
                          tk.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {tk.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500">{new Date(tk.createdAt).toLocaleString()}</td>
                      <td className="py-4 px-4 text-right">
                        {tk.status !== 'RESOLVED' ? (
                          <button
                            onClick={() => {
                              setSelectedTicket(tk);
                              setShowTicketModal(true);
                            }}
                            className="btn-primary text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1.5 tracking-wider font-bold inline-flex"
                          >
                            <Send className="h-3 w-3" /> Respond
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-medium italic">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400 italic">No tickets in the queue. Everything is running smoothly.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: USAGE MONITOR */}
        {activeTab === 'usage' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Storage Comparison chart */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900">Storage Load Comparison (MB)</h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tenants}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="slug" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip formatter={(value: any) => `${(Number(value) / (1024 * 1024)).toFixed(2)} MB`} />
                    <Bar dataKey="storageUsageBytes" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {tenants.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#8b5cf6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* API Load comparison */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900">API Calls Tracking (Current Month)</h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tenants}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="slug" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="apiCallsCount" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                      {tenants.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f59e0b' : '#ec4899'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL 1: PLAN UPGRADE */}
      {showUpgradeModal && selectedTenant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-2xl animate-fade-in text-gray-800">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Modify Subscription: {selectedTenant.name}</h3>
              <button onClick={() => setShowUpgradeModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Subscription Plan</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-amber-500 font-semibold"
                >
                  <option value="" disabled>Choose a plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price} / mo
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowUpgradeModal(false)} className="btn-secondary flex-1 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold text-xs">Cancel</button>
                <button onClick={handleUpgradePlanSubmit} className="btn-primary flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs shadow-lg shadow-amber-500/10">Apply Plan Change</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TICKET RESOLUTION */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-gray-100 shadow-2xl animate-fade-in text-gray-800">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Respond to Support Request</h3>
              <button onClick={() => setShowTicketModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100">
                <div className="text-[10px] uppercase font-bold text-gray-400">Subject</div>
                <div className="text-sm font-semibold text-gray-900 mt-0.5">{selectedTicket.subject}</div>
                <div className="text-[10px] text-gray-400 mt-2">Submitted by {selectedTicket.creator?.email} ({selectedTicket.tenant?.name})</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Write Resolution Response</label>
                <textarea
                  rows={4}
                  value={ticketResponse}
                  onChange={(e) => setTicketResponse(e.target.value)}
                  placeholder="Describe details of the resolution or support response..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-amber-500 text-gray-800"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowTicketModal(false)} className="btn-secondary flex-1 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold text-xs">Cancel</button>
                <button onClick={handleTicketRespondSubmit} className="btn-primary flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs shadow-lg shadow-amber-500/10">Submit & Resolve</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Internal mini icons
const LoaderSpinner = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
export default SuperAdminDashboard;
