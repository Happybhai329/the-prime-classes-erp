import React, { useState } from 'react';
import {
  PhoneCall,
  Calendar,
  CheckCircle,
  Activity,
  PlusCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Mail,
  User,
} from 'lucide-react';

const mockDashboardStats = {
  totalLeadsAssigned: 84,
  activeLeads: 42,
  admissionsClosed: 15,
  callsMade: 184,
  conversionRate: 17.8,
};

const mockFollowUpsDue = [
  { id: 'f1', time: '10:30 AM', leadName: 'Arjun Verma', phone: '9876543011', type: 'Call', score: 85, notes: 'Parent asked to call back regarding fee installments.' },
  { id: 'f2', time: '11:15 AM', leadName: 'Neha Malhotra', phone: '9876543012', type: 'WhatsApp', score: 72, notes: 'Send Sainik School preparation brochure on WhatsApp.' },
  { id: 'f3', time: '02:00 PM', leadName: 'Vikram Sethi', phone: '9876543013', type: 'Call', score: 48, notes: 'First inquiry callback. Check current schooling and target exam.' },
  { id: 'f4', time: '04:30 PM', leadName: 'Meera Deshmukh', phone: '9876543014', type: 'Email', score: 91, notes: 'Scholarship test discount proposal discussion.' },
];

export const CounselorDashboard: React.FC = () => {
  const [selectedLead, setSelectedLead] = useState<any>(mockFollowUpsDue[0]);
  const [activityType, setActivityType] = useState('CALL');
  const [activityDesc, setActivityDesc] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  const handleLogActivity = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Logged ${activityType} activity: "${activityDesc}" for ${selectedLead.leadName}. Next follow-up set for ${nextFollowUpDate || 'not scheduled'}.`);
    setActivityDesc('');
    setNextFollowUpDate('');
  };

  return (
    <div className="space-y-6 animate-slide-up p-1">
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900 tracking-tight">Counselor Workspace</h1>
        <p className="text-sm text-gray-500">Log client contact activities, schedule callbacks, and review your personal conversion pipeline metrics.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Leads Assigned</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{mockDashboardStats.totalLeadsAssigned}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <User className="h-5 w-5" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Active Pipeline</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{mockDashboardStats.activeLeads}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Admissions Closed</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{mockDashboardStats.admissionsClosed}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Calls Made</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{mockDashboardStats.callsMade}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
            <PhoneCall className="h-5 w-5" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">My Conv. Rate</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{mockDashboardStats.conversionRate}%</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Followups list */}
        <div className="card overflow-hidden col-span-1 lg:col-span-2 flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-500" /> Today's Follow-up Calendar
            </h3>
            <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded">
              {mockFollowUpsDue.length} ACTION REQUIRED
            </span>
          </div>

          <div className="divide-y divide-gray-50 flex-1 overflow-y-auto max-h-[460px]">
            {mockFollowUpsDue.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedLead(item)}
                className={`p-5 flex flex-col sm:flex-row items-start justify-between gap-3 hover:bg-gray-50/50 transition-colors cursor-pointer ${
                  selectedLead?.id === item.id ? 'bg-indigo-50/30 border-l-4 border-indigo-600' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {item.time}
                    </span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      item.type === 'WhatsApp'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.type === 'Email'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">{item.leadName}</h4>
                  <p className="text-xs text-gray-500">{item.phone}</p>
                  <p className="text-xs italic text-gray-400 mt-1">"{item.notes}"</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    Prob: {item.score}%
                  </span>
                  <button className="p-1 text-gray-400 hover:text-indigo-600 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Action panel log activity */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
            <PhoneCall className="h-4 w-4 text-indigo-500" /> Log Lead Interaction
          </h3>

          <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-3.5 mb-4 text-xs">
            <p className="text-gray-400 uppercase font-bold text-[9px] tracking-wider">Target Lead</p>
            <p className="font-bold text-gray-900 text-sm mt-0.5">{selectedLead?.leadName}</p>
            <p className="text-gray-500 mt-0.5">{selectedLead?.phone}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                AI SCORE: {selectedLead?.score}%
              </span>
            </div>
          </div>

          <form onSubmit={handleLogActivity} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Interaction Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActivityType('CALL')}
                  className={`py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                    activityType === 'CALL'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <PhoneCall className="h-3.5 w-3.5" /> Call
                </button>
                <button
                  type="button"
                  onClick={() => setActivityType('WHATSAPP')}
                  className={`py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                    activityType === 'WHATSAPP'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Chat
                </button>
                <button
                  type="button"
                  onClick={() => setActivityType('EMAIL')}
                  className={`py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                    activityType === 'EMAIL'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" /> Email
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Call/Interaction Summary
              </label>
              <textarea
                required
                rows={3}
                placeholder="Details of discussion..."
                className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2.5 text-xs text-gray-700"
                value={activityDesc}
                onChange={(e) => setActivityDesc(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Schedule Next Callback / Task
              </label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs text-gray-700"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Save Activity & Timeline
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
