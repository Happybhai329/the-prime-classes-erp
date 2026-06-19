import React, { useState } from 'react';
import { useAttendanceSessions, useAttendanceReport } from '@/hooks/useAttendance';
import { useBatches } from '@/hooks/useBatches';
import { useStudents } from '@/hooks/useStudents';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { CheckCircle, Lock, Download, Printer, Search, X, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const AttendanceHistoryPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [batchId, setBatchId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  // Fetch batches for filter dropdown
  const { data: batchesData } = useBatches({ limit: 100 });
  const batches = batchesData?.data || [];

  // Fetch students for search suggestion
  const { data: studentsData } = useStudents({ 
    search: studentSearch || undefined, 
    limit: 10 
  });
  const matchingStudents = studentsData?.data || [];

  // Sessions Query
  const sessionsQuery = useAttendanceSessions({
    page,
    limit: 20,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    batchId: batchId || undefined,
  });

  // Student Attendance Report Query (if student is selected)
  const studentReportQuery = useAttendanceReport(
    'student', 
    selectedStudent?.id || '', 
    { 
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      batchId: batchId || undefined,
    }
  );

  const isStudentMode = !!selectedStudent;
  const currentQuery = isStudentMode ? studentReportQuery : sessionsQuery;
  
  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setBatchId('');
    setSelectedStudent(null);
    setStudentSearch('');
    setPage(1);
  };

  const handleExportCSV = () => {
    if (isStudentMode) {
      const records = studentReportQuery.data?.records || [];
      if (records.length === 0) return;
      const headers = ['Date', 'Session Type', 'Batch Name', 'Subject Name', 'Status', 'Remarks'];
      const rows = records.map((r: any) => [
        r.date,
        r.sessionType,
        r.batchName,
        r.subjectName || 'N/A',
        r.status,
        r.remarks || ''
      ]);
      exportToCSV(headers, rows, `attendance_${selectedStudent.firstName}_${selectedStudent.lastName}.csv`);
    } else {
      const sessions = sessionsQuery.data?.data || [];
      if (sessions.length === 0) return;
      const headers = ['Date', 'Batch', 'Session Type', 'Subject', 'Present Rate', 'Taken By', 'Status'];
      const rows = sessions.map((s: any) => [
        s.sessionDate,
        s.batchName,
        s.sessionType,
        s.subjectName || 'N/A',
        `${s.presentCount}/${s.totalStudents} (${s.totalStudents > 0 ? Math.round((s.presentCount/s.totalStudents)*100) : 0}%)`,
        s.takenByName,
        s.isFinalized ? 'Finalized' : 'Editable'
      ]);
      exportToCSV(headers, rows, 'attendance_sessions_history.csv');
    }
  };

  const exportToCSV = (headers: string[], rows: any[][], filename: string) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  // Define table columns based on mode
  const columns = isStudentMode 
    ? [
        {
          key: 'date',
          header: 'Date',
          render: (r: any) => (
            <span className="font-medium text-gray-900">
              {new Date(r.date).toLocaleDateString()}
            </span>
          ),
        },
        {
          key: 'batch',
          header: 'Batch',
          render: (r: any) => <span className="badge-primary">{r.batchName}</span>,
        },
        {
          key: 'type',
          header: 'Session Type',
          render: (r: any) => <span className="text-sm text-gray-600">{r.sessionType}</span>,
        },
        {
          key: 'subject',
          header: 'Subject',
          render: (r: any) => <span className="text-sm text-gray-600">{r.subjectName || 'General'}</span>,
        },
        {
          key: 'status',
          header: 'Status',
          render: (r: any) => <StatusBadge status={r.status} />,
        },
        {
          key: 'remarks',
          header: 'Remarks',
          render: (r: any) => <span className="text-xs text-gray-400 italic">{r.remarks || '—'}</span>,
        },
      ]
    : [
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
                    className={`h-full rounded-full ${percentage >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
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
              <span className="badge bg-gray-150 text-gray-700 gap-1 inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full">
                <Lock className="h-3 w-3" /> Finalized
              </span>
            ) : (
              <span className="badge bg-green-100 text-green-700 gap-1 inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full">
                <CheckCircle className="h-3 w-3" /> Editable
              </span>
            )
          ),
        },
      ];

  const tableData = isStudentMode 
    ? (studentReportQuery.data?.records || []) 
    : (sessionsQuery.data?.data || []);

  const total = isStudentMode ? tableData.length : (sessionsQuery.data?.meta?.total || 0);

  return (
    <div id="attendance-history-page" className="space-y-6">
      {/* Print-only CSS style injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #attendance-history-page, #attendance-history-page * {
            visibility: visible;
          }
          #attendance-history-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .table-container {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}} />

      <PageHeader
        title="Attendance History"
        description={
          isStudentMode 
            ? `Attendance records for ${selectedStudent.firstName} ${selectedStudent.lastName} (${studentReportQuery.data?.summary?.percentage || 0}% overall present rate)` 
            : `View and export past attendance sessions (${total} sessions found)`
        }
        actions={
          <div className="flex gap-2 no-print">
            <Button variant="secondary" onClick={handleExportCSV} disabled={tableData.length === 0} className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="secondary" onClick={handleExportPDF} disabled={tableData.length === 0} className="flex items-center gap-2">
              <Printer className="h-4 w-4" /> Print PDF
            </Button>
          </div>
        }
      />

      {/* Filter Toolbar */}
      <div className="card p-4 flex flex-wrap gap-4 items-center justify-between bg-white border border-gray-200 rounded-xl shadow-sm no-print">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Date Range Picker */}
          <div>
            <label className="label text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Date Range</label>
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

          {/* Batch Selector */}
          <div>
            <label className="label text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Batch</label>
            <FilterDropdown
              label="Select Batch"
              value={batchId}
              onChange={(val) => { setBatchId(val || ''); setPage(1); }}
              options={batches.map((b: any) => ({ label: b.name, value: b.id }))}
            />
          </div>

          {/* Student Search Filter */}
          <div className="relative">
            <label className="label text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Student Filter</label>
            {selectedStudent ? (
              <div className="flex items-center gap-1.5 bg-primary-50 text-primary-700 px-3 py-2 rounded-lg border border-primary-200 text-sm font-medium">
                <User className="w-3.5 h-3.5" />
                <span>{selectedStudent.firstName} {selectedStudent.lastName}</span>
                <button 
                  onClick={() => { setSelectedStudent(null); setStudentSearch(''); }}
                  className="hover:text-primary-900 p-0.5 rounded-full hover:bg-primary-100 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  className="input pl-9 pr-3 py-2 w-full text-sm"
                  placeholder="Search student..."
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setShowStudentDropdown(true);
                  }}
                  onFocus={() => setShowStudentDropdown(true)}
                  onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
                />
                
                {/* Search Suggestion Dropdown */}
                {showStudentDropdown && studentSearch.length > 0 && matchingStudents.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {matchingStudents.map((stu: any) => (
                      <button
                        key={stu.id}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-900 border-b border-gray-100 last:border-b-0"
                        onMouseDown={() => {
                          setSelectedStudent(stu);
                          setShowStudentDropdown(false);
                        }}
                      >
                        <div className="font-semibold">{stu.firstName} {stu.lastName}</div>
                        <div className="text-xs text-gray-500">Roll: {stu.rollNumber}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleClearFilters}
          className="btn-ghost text-sm h-10 px-3 hover:bg-gray-100 rounded-lg transition-colors mt-4 text-gray-500 font-medium"
        >
          Clear Filters
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={tableData}
          isLoading={currentQuery.isLoading}
          emptyTitle="No attendance sessions found"
          emptyDescription="Try broadening your filters or mark attendance to see history."
        />

        {!isStudentMode && sessionsQuery.data?.meta && sessionsQuery.data.meta.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-end no-print">
            <Pagination
              page={page}
              totalPages={sessionsQuery.data.meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};
