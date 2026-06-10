import React, { useState } from 'react';
import { useAttendanceSessions } from '@/hooks/useAttendance';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { CheckCircle, Lock } from 'lucide-react';

export const AttendanceHistoryPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading } = useAttendanceSessions({
    page,
    limit: 20,
    dateFrom,
    dateTo,
  });

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (s: any) => (
        <span className="font-medium text-gray-900">
          {new Date(s.sessionDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'batch',
      header: 'Batch',
      render: (s: any) => <span className="badge-primary">{s.batchName}</span>,
    },
    {
      key: 'type',
      header: 'Session Type',
      render: (s: any) => <span className="text-sm text-gray-600">{s.sessionType}</span>,
    },
    {
      key: 'stats',
      header: 'Statistics',
      render: (s: any) => {
        const percentage = s.totalStudents > 0 
          ? Math.round((s.presentCount / s.totalStudents) * 100) 
          : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${percentage >= 80 ? 'bg-success-500' : 'bg-warning-500'}`} 
                style={{ width: `${percentage}%` }} 
              />
            </div>
            <span className="text-xs font-medium text-gray-600">{percentage}%</span>
            <span className="text-xs text-gray-400">({s.presentCount}/{s.totalStudents})</span>
          </div>
        );
      },
    },
    {
      key: 'takenBy',
      header: 'Taken By',
      render: (s: any) => <span className="text-sm text-gray-600">{s.takenByName}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (s: any) => (
        s.isFinalized ? (
          <span className="badge bg-gray-100 text-gray-700 gap-1">
            <Lock className="h-3 w-3" /> Finalized
          </span>
        ) : (
          <span className="badge-success gap-1">
            <CheckCircle className="h-3 w-3" /> Editable
          </span>
        )
      ),
    },
  ];

  return (
    <div id="attendance-history-page">
      <PageHeader
        title="Attendance History"
        description="View past attendance sessions"
      />

      <div className="card p-4 mb-6 flex flex-wrap gap-4 items-end bg-white">
        <div>
          <label className="label text-xs">Date Range</label>
          <DateRangePicker
            startDate={dateFrom}
            endDate={dateTo}
            onChange={(start, end) => {
              setDateFrom(start);
              setDateTo(end);
              setPage(1);
            }}
          />
        </div>
        <button 
          onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
          className="btn-ghost text-sm h-10"
        >
          Clear Filters
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyTitle="No attendance sessions found"
        emptyDescription="Mark attendance to see history here."
      />

      {data?.meta && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
      )}
    </div>
  );
};
