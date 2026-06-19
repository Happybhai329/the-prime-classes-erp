import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Send,
  Plus,
  Mail,
  MessageSquare,
  Bell,
  Play,
  Settings,
} from 'lucide-react';

const mockCampaigns = [
  {
    id: 'c1',
    name: 'Admission Drive Phase 2',
    type: 'ADMISSION',
    channel: 'EMAIL',
    status: 'COMPLETED',
    subject: 'Unlock Your Child\'s Future - Admissions Open 2026',
    metrics: { sent: 1250, delivered: 1200, opened: 680, clicked: 180 },
    createdAt: '2026-06-01',
  },
  {
    id: 'c2',
    name: 'Scholarship Exam Reminder',
    type: 'SCHOLARSHIP',
    channel: 'WHATSAPP',
    status: 'ACTIVE',
    subject: '',
    metrics: { sent: 800, delivered: 780, opened: 750, clicked: 320 },
    createdAt: '2026-06-10',
  },
  {
    id: 'c3',
    name: 'Parent Seminar Invitation',
    type: 'EVENT',
    channel: 'PUSH',
    status: 'DRAFT',
    subject: '',
    metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0 },
    createdAt: '2026-06-15',
  },
];

export const CampaignManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignType, setNewCampaignType] = useState('ADMISSION');
  const [newCampaignChannel, setNewCampaignChannel] = useState('EMAIL');
  const [newCampaignSubject, setNewCampaignSubject] = useState('');
  const [newCampaignBody, setNewCampaignBody] = useState('');

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const newCamp = {
      id: `c${campaigns.length + 1}`,
      name: newCampaignName,
      type: newCampaignType,
      channel: newCampaignChannel,
      status: 'DRAFT',
      subject: newCampaignSubject,
      metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0 },
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCampaigns([newCamp, ...campaigns]);
    setShowCreateModal(false);
    // Reset Form
    setNewCampaignName('');
    setNewCampaignSubject('');
    setNewCampaignBody('');
  };

  const handleTriggerCampaign = (id: string) => {
    setCampaigns(
      campaigns.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: 'COMPLETED',
            metrics: { sent: 450, delivered: 420, opened: 210, clicked: 95 },
          };
        }
        return c;
      }),
    );
    toast.success('Campaign broadcast successfully triggered!');
  };

  return (
    <div className="space-y-6 animate-slide-up p-1">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 tracking-tight">Marketing Campaigns</h1>
          <p className="text-sm text-gray-500">Dispatch bulk emails, WhatsApp templates, and push alerts to segmented lists of student inquiries.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center gap-2 text-xs font-bold py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 shadow"
        >
          <Plus className="h-4 w-4" /> Create Campaign
        </button>
      </div>

      {/* Campaigns Listing */}
      <div className="grid grid-cols-1 gap-4">
        {campaigns.map((camp) => (
          <div key={camp.id} className="card p-5 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  camp.type === 'ADMISSION'
                    ? 'bg-blue-50 text-blue-700'
                    : camp.type === 'SCHOLARSHIP'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {camp.type}
                </span>

                <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400">
                  {camp.channel === 'EMAIL' && <Mail className="h-3 w-3" />}
                  {camp.channel === 'WHATSAPP' && <MessageSquare className="h-3 w-3" />}
                  {camp.channel === 'PUSH' && <Bell className="h-3 w-3" />}
                  {camp.channel}
                </span>

                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  camp.status === 'COMPLETED'
                    ? 'bg-gray-100 text-gray-700'
                    : camp.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {camp.status}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-base">{camp.name}</h3>
              {camp.subject && <p className="text-xs text-gray-500 italic">"Subject: {camp.subject}"</p>}
              <p className="text-[11px] text-gray-400">Created on {camp.createdAt}</p>
            </div>

            {/* Metrics */}
            {camp.status !== 'DRAFT' ? (
              <div className="grid grid-cols-4 gap-4 bg-gray-50 border border-gray-100 rounded-lg p-3 text-center min-w-[320px]">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Sent</p>
                  <p className="font-extrabold text-gray-900 text-sm mt-0.5">{camp.metrics.sent}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Delivered</p>
                  <p className="font-extrabold text-gray-900 text-sm mt-0.5">{camp.metrics.delivered}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Opened</p>
                  <p className="font-extrabold text-indigo-600 text-sm mt-0.5">
                    {camp.metrics.opened} ({camp.metrics.delivered > 0 ? Math.round((camp.metrics.opened / camp.metrics.delivered) * 100) : 0}%)
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Clicks</p>
                  <p className="font-extrabold text-emerald-600 text-sm mt-0.5">
                    {camp.metrics.clicked} ({camp.metrics.opened > 0 ? Math.round((camp.metrics.clicked / camp.metrics.opened) * 100) : 0}%)
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleTriggerCampaign(camp.id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold py-2 px-4 shadow flex items-center gap-1.5 transition-colors"
                >
                  <Play className="h-3.5 w-3.5" /> Trigger Dispatch
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-500" /> New Marketing Campaign
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sainik Entrance Scholarship Jan"
                  className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2.5 text-xs text-gray-700"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Campaign Type
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs text-gray-700"
                    value={newCampaignType}
                    onChange={(e) => setNewCampaignType(e.target.value)}
                  >
                    <option value="ADMISSION">Admission Campaign</option>
                    <option value="SCHOLARSHIP">Scholarship Campaign</option>
                    <option value="EVENT">Event Campaign</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Broadcasting Channel
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs text-gray-700"
                    value={newCampaignChannel}
                    onChange={(e) => setNewCampaignChannel(e.target.value)}
                  >
                    <option value="EMAIL">Email Template</option>
                    <option value="WHATSAPP">WhatsApp Ready API</option>
                    <option value="PUSH">App Push Notification</option>
                  </select>
                </div>
              </div>

              {newCampaignChannel === 'EMAIL' && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Email Subject Line
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter email subject..."
                    className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2.5 text-xs text-gray-700"
                    value={newCampaignSubject}
                    onChange={(e) => setNewCampaignSubject(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Message Body Content
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Hello {{ firstName }}, welcome to..."
                  className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2.5 text-xs text-gray-700"
                  value={newCampaignBody}
                  onChange={(e) => setNewCampaignBody(e.target.value)}
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Supports dynamic variable interpolation like {"{{ firstName }}"} and {"{{ lastName }}"}.
                </span>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1"
                >
                  <Send className="h-3.5 w-3.5" /> Save Draft Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
