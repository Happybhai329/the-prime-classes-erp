import React, { useState } from 'react';
import {
  useDashboardFollowUps,
  useFollowUpTimeline,
  useCreateFollowUp,
  useEnquiries,
} from '@/hooks/useSales';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Loader2,
  Calendar,
  Clock,
  AlertTriangle,
  Plus,
  X,
  PhoneCall,
  Search,
  Mail,
  MessageSquare,
} from 'lucide-react';

export const FollowUpPage: React.FC = () => {
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string>('');
  const [isLogOpen, setIsLogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    enquiryId: '',
    date: new Date().toISOString().split('T')[0],
    nextFollowUp: '',
    type: 'Call',
    remarks: '',
    status: 'PENDING',
  });

  const { data: dashboardFollowUps, isLoading: loadingDash } = useDashboardFollowUps();
  const { data: timeline, isLoading: loadingTimeline } = useFollowUpTimeline(selectedEnquiryId);

  // Search enquiries for logging new follow-up
  const [enquirySearch, setEnquirySearch] = useState('');
  const { data: searchEnquiriesRes } = useEnquiries({
    limit: 100,
    search: enquirySearch || undefined,
  });
  const searchEnquiries = searchEnquiriesRes?.data || [];

  const createMutation = useCreateFollowUp();

  const handleOpenLog = (enquiryId?: string) => {
    setFormData({
      enquiryId: enquiryId || selectedEnquiryId || '',
      date: new Date().toISOString().split('T')[0],
      nextFollowUp: '',
      type: 'Call',
      remarks: '',
      status: 'PENDING',
    });
    setIsLogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: () => {
        setIsLogOpen(false);
      },
    });
  };

  // Get icons based on type
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'call':
        return <PhoneCall className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups Timeline"
        description="Monitor today's, upcoming, and missed follow-ups, and review engagement history for prospective students."
        actions={
          <button
            onClick={() => handleOpenLog()}
            className="btn btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <Plus className="h-4 w-4" /> Log Follow-up
          </button>
        }
      />

      {/* Columns: Today, Missed, Upcoming */}
      {loadingDash ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="animate-spin text-primary-600 h-6 w-6" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Missed Follow-ups */}
          <div className="card p-5 bg-white border border-red-200 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-red-700 font-bold border-b border-red-100 pb-2">
              <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Missed ({dashboardFollowUps?.missed?.length || 0})</h3>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[220px] text-xs">
              {dashboardFollowUps?.missed?.map((f: any) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedEnquiryId(f.enquiryId)}
                  className="p-3 bg-red-50/50 hover:bg-red-50 border border-red-100 rounded-lg cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>{f.enquiry.studentName}</span>
                    <span className="text-[10px] text-red-600">{new Date(f.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-500 text-[10px]">{f.enquiry.enquiryNumber}</p>
                  <p className="text-gray-600 line-clamp-1 italic">"{f.remarks || 'No remarks'}"</p>
                </div>
              ))}
              {(dashboardFollowUps?.missed || []).length === 0 && (
                <p className="text-center text-gray-400 py-4">No missed follow-ups!</p>
              )}
            </div>
          </div>

          {/* Today's Follow-ups */}
          <div className="card p-5 bg-white border border-amber-200 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-700 font-bold border-b border-amber-100 pb-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Today's ({dashboardFollowUps?.today?.length || 0})</h3>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[220px] text-xs">
              {dashboardFollowUps?.today?.map((f: any) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedEnquiryId(f.enquiryId)}
                  className="p-3 bg-amber-50/50 hover:bg-amber-50 border border-amber-100 rounded-lg cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>{f.enquiry.studentName}</span>
                    <span className="text-[10px] text-amber-600">{f.type}</span>
                  </div>
                  <p className="text-gray-500 text-[10px]">{f.enquiry.enquiryNumber}</p>
                  <p className="text-gray-600 line-clamp-1 italic">"{f.remarks || 'No remarks'}"</p>
                </div>
              ))}
              {(dashboardFollowUps?.today || []).length === 0 && (
                <p className="text-center text-gray-400 py-4">No follow-ups for today.</p>
              )}
            </div>
          </div>

          {/* Upcoming Follow-ups */}
          <div className="card p-5 bg-white border border-blue-200 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold border-b border-blue-100 pb-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Upcoming ({dashboardFollowUps?.upcoming?.length || 0})</h3>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[220px] text-xs">
              {dashboardFollowUps?.upcoming?.map((f: any) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedEnquiryId(f.enquiryId)}
                  className="p-3 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-lg cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>{f.enquiry.studentName}</span>
                    <span className="text-[10px] text-blue-600">{new Date(f.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-500 text-[10px]">{f.enquiry.enquiryNumber}</p>
                  <p className="text-gray-600 line-clamp-1 italic">"{f.remarks || 'No remarks'}"</p>
                </div>
              ))}
              {(dashboardFollowUps?.upcoming || []).length === 0 && (
                <p className="text-center text-gray-400 py-4">No upcoming follow-ups scheduled.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Enquiry Timeline Selection Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enquiry Selector */}
        <div className="card p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4 lg:col-span-1">
          <h3 className="text-base font-semibold text-gray-900">Select Enquiry</h3>
          <div className="relative text-xs">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search enquiries..."
              value={enquirySearch}
              onChange={(e) => setEnquirySearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[300px] text-xs">
            {searchEnquiries.map((e: any) => (
              <div
                key={e.id}
                onClick={() => setSelectedEnquiryId(e.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedEnquiryId === e.id
                    ? 'bg-primary-50 border-primary-300 text-primary-900 font-bold shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{e.studentName}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{e.enquiryNumber}</span>
                </div>
                <div className="text-[10px] text-gray-500 font-medium">{e.mobile}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Display */}
        <div className="card p-6 bg-white border border-gray-200 rounded-xl shadow-sm lg:col-span-2 space-y-4">
          <h3 className="text-base font-semibold text-gray-900">Follow-up History</h3>

          {!selectedEnquiryId ? (
            <div className="text-center py-16 text-gray-400 text-xs">
              Select an enquiry from the list to view its follow-up timeline.
            </div>
          ) : loadingTimeline ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-primary-600 h-6 w-6" />
            </div>
          ) : (
            <div className="relative border-l border-gray-200 pl-6 ml-4 space-y-6 text-xs">
              {timeline.map((item: any) => (
                <div key={item.id} className="relative">
                  {/* Icon indicator */}
                  <span className="absolute -left-[38px] top-1 bg-white border border-gray-300 rounded-full p-1.5 text-primary-700 shadow-sm">
                    {getTypeIcon(item.type)}
                  </span>

                  <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                      <span className="flex items-center gap-1">
                        Status:{' '}
                        <span
                          className={`px-1.5 py-0.5 rounded-full ${
                            item.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </span>
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>

                    <p className="text-gray-800 text-xs font-medium">"{item.remarks || 'No remarks captured.'}"</p>

                    {item.nextFollowUp && (
                      <div className="text-[10px] text-primary-700 font-semibold bg-primary-50 rounded-lg p-1.5 inline-block">
                        Next Scheduled Follow-up: {new Date(item.nextFollowUp).toLocaleDateString()}
                      </div>
                    )}

                    {item.executive && (
                      <div className="text-[9px] text-gray-400 text-right">Logged by: {item.executive.email}</div>
                    )}
                  </div>
                </div>
              ))}

              {timeline.length === 0 && (
                <div className="text-center py-8 text-gray-400">No follow-ups recorded for this enquiry.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Log Follow-up Modal */}
      {isLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="bg-primary-700 p-5 text-white flex justify-between items-center">
              <h3 className="text-sm font-semibold">Log Follow-up</h3>
              <button type="button" onClick={() => setIsLogOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Enquiry *</label>
                <select
                  required
                  value={formData.enquiryId}
                  onChange={(e) => setFormData({ ...formData, enquiryId: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary-500"
                >
                  <option value="">-- Choose Enquiry --</option>
                  {searchEnquiries.map((e: any) => (
                    <option key={e.id} value={e.id}>
                      {e.studentName} ({e.enquiryNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Follow-up Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Next Follow-up Date (Optional)</label>
                <input
                  type="date"
                  value={formData.nextFollowUp}
                  onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Follow-up Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary-500"
                >
                  <option value="Call">Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                  <option value="In Person">In Person</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="MISSED">Missed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Remarks *</label>
                <textarea
                  required
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg h-16 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsLogOpen(false)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Log Follow-up
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
