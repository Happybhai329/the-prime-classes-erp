import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCalendarEvents, useCreateCalendarEvent, useDeleteCalendarEvent } from '@/hooks/useCalendarEvents';
import { useBatches } from '@/hooks/useBatches';
import { useAuthStore } from '@/store/auth.store';
import { Calendar, Plus, Trash2, Clock, ChevronLeft, ChevronRight, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export const AcademicCalendarPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdminOrFaculty = ['ADMIN', 'SUPER_ADMIN', 'FACULTY'].includes(user?.role || '');

  // Calendar State
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<any | null>(null);

  // Form States for creating event
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventType, setEventType] = useState<'HOLIDAY' | 'EVENT' | 'EXAM' | 'IMPORTANT_DATE'>('EVENT');
  const [batchId, setBatchId] = useState('');

  // Queries
  const { data: eventsData, isLoading: eventsLoading } = useCalendarEvents({
    startDate: new Date(currentYear, currentMonth, 1).toISOString(),
    endDate: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString(),
  });
  const events = eventsData?.data || [];

  const { data: batchesData } = useBatches({ limit: 100 });
  const batches = batchesData?.data || [];

  // Mutations
  const createEventMutation = useCreateCalendarEvent();
  const deleteEventMutation = useDeleteCalendarEvent();

  // Calendar Grid Calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarCells: (Date | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(new Date(currentYear, currentMonth, d));
  }

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to color-code event types
  const getEventColors = (type: string) => {
    switch (type) {
      case 'HOLIDAY':
        return { text: 'text-red-700', bg: 'bg-red-50 hover:bg-red-100', dot: 'bg-red-500', border: 'border-red-200' };
      case 'EXAM':
        return { text: 'text-orange-700', bg: 'bg-orange-50 hover:bg-orange-100', dot: 'bg-orange-500', border: 'border-orange-200' };
      case 'IMPORTANT_DATE':
        return { text: 'text-emerald-700', bg: 'bg-emerald-50 hover:bg-emerald-100', dot: 'bg-emerald-500', border: 'border-emerald-200' };
      default: // EVENT
        return { text: 'text-blue-700', bg: 'bg-blue-50 hover:bg-blue-100', dot: 'bg-blue-500', border: 'border-blue-200' };
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate || !eventType) {
      toast.error('Required fields are missing');
      return;
    }

    try {
      await createEventMutation.mutateAsync({
        title,
        description,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        eventType,
        batchId: batchId || undefined,
      });
      toast.success('Calendar event added successfully');
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setEventType('EVENT');
      setBatchId('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Creation failed');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this calendar event?")) return;
    try {
      await deleteEventMutation.mutateAsync(id);
      toast.success('Event deleted');
      setSelectedEventDetails(null);
    } catch {
      toast.error('Deletion failed');
    }
  };

  return (
    <div id="academic-calendar-page" className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Academic Calendar"
          description="View holidays, events, exams, and important academic dates."
        />
        {isAdminOrFaculty && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition shadow-sm self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Add Event
          </button>
        )}
      </div>

      {/* Month Selector Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary-500" /> {monthNames[currentMonth]} {currentYear}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setCurrentYear(today.getFullYear());
              setCurrentMonth(today.getMonth());
            }}
            className="px-3 py-1 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid Sheet */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-gray-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {eventsLoading ? (
            <LoadingSpinner size="md" className="py-20" />
          ) : (
            <div className="grid grid-cols-7 gap-1.5 aspect-[7/5]">
              {calendarCells.map((cellDate, idx) => {
                if (!cellDate) {
                  return <div key={`empty-${idx}`} className="bg-gray-50/30 rounded-xl border border-dashed border-gray-100" />;
                }

                const dateStr = cellDate.getDate();
                const isCurrentToday =
                  cellDate.getDate() === today.getDate() &&
                  cellDate.getMonth() === today.getMonth() &&
                  cellDate.getFullYear() === today.getFullYear();

                // Find events on this date
                const dayEvents = events.filter((e: any) => {
                  const s = new Date(e.startDate);
                  const end = new Date(e.endDate);
                  // Normalize dates to midnight for range checks
                  const check = new Date(cellDate);
                  check.setHours(0,0,0,0);
                  s.setHours(0,0,0,0);
                  end.setHours(23,59,59,999);
                  return check >= s && check <= end;
                });

                return (
                  <div
                    key={cellDate.toISOString()}
                    onClick={() => {
                      setSelectedDate(cellDate);
                      if (dayEvents.length > 0) {
                        setSelectedEventDetails(dayEvents[0]);
                      } else {
                        setSelectedEventDetails(null);
                      }
                    }}
                    className={`p-2 rounded-xl border transition cursor-pointer flex flex-col justify-between hover:bg-gray-50/50 ${
                      isCurrentToday ? 'border-primary-500 bg-primary-50/20' : 'border-gray-50 bg-white'
                    }`}
                  >
                    <span className={`text-xs font-bold ${isCurrentToday ? 'text-primary-600' : 'text-gray-700'}`}>
                      {dateStr}
                    </span>

                    {/* Render Event indicator pills */}
                    <div className="space-y-0.5 mt-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((e: any) => {
                        const style = getEventColors(e.eventType);
                        return (
                          <div
                            key={e.id}
                            className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md truncate max-w-full ${style.bg} ${style.text}`}
                            title={e.title}
                          >
                            {e.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[7px] font-bold text-gray-400 text-center uppercase">
                          + {dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Panel: Event Details / Upcoming */}
        <div className="space-y-6">
          {/* Selected Event details */}
          {selectedEventDetails ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 relative">
              <button
                onClick={() => setSelectedEventDetails(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                Clear
              </button>
              <div>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  getEventColors(selectedEventDetails.eventType).text
                } ${getEventColors(selectedEventDetails.eventType).bg}`}>
                  {selectedEventDetails.eventType}
                </span>
                <h4 className="text-base font-bold text-gray-900 mt-2">{selectedEventDetails.title}</h4>
              </div>

              <div className="space-y-2 text-xs text-gray-600">
                <p className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>Start: {new Date(selectedEventDetails.startDate).toLocaleString()}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>End: {new Date(selectedEventDetails.endDate).toLocaleString()}</span>
                </p>
                {selectedEventDetails.batch && (
                  <p className="flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-gray-400" />
                    <span>Target Batch: {selectedEventDetails.batch.name}</span>
                  </p>
                )}
              </div>

              {selectedEventDetails.description && (
                <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {selectedEventDetails.description}
                </p>
              )}

              {isAdminOrFaculty && (
                <button
                  onClick={() => handleDeleteEvent(selectedEventDetails.id)}
                  className="w-full py-2 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50 transition mt-2"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Event
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center py-10 flex flex-col items-center justify-center text-gray-400">
              <Info className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-xs">Select any day with events to view detailed descriptions.</p>
            </div>
          )}

          {/* Color Key Legend */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Calendar Legends</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="font-medium text-gray-700">Holidays</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="font-medium text-gray-700">Institute Events</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="font-medium text-gray-700">Term Exams</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-medium text-gray-700">Important Dates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary-500" /> Add Calendar Event
            </h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Event Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 text-sm"
                  placeholder="e.g. Science Mock Exam"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 text-sm h-20 resize-none"
                  placeholder="Add details about this event..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 text-sm bg-white"
                    required
                  >
                    <option value="EVENT">Event</option>
                    <option value="HOLIDAY">Holiday</option>
                    <option value="EXAM">Exam</option>
                    <option value="IMPORTANT_DATE">Important Date</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Batch Filter (Optional)</label>
                  <select
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 text-sm bg-white"
                  >
                    <option value="">All Batches</option>
                    {batches.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
