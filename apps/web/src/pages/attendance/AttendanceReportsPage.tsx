import React, { useState } from 'react';
import { useAttendanceReport } from '@/hooks/useAttendance';
import { PageHeader } from '@/components/ui/PageHeader';
import { TabGroup } from '@/components/ui/TabGroup';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { DataTable } from '@/components/ui/DataTable';

const tabs = [
  { id: 'daily', label: 'Daily Summary' },
  { id: 'monthly', label: 'Monthly Summary' },
];

export const AttendanceReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: dailyData, isLoading: dailyLoading } = useAttendanceReport('daily', undefined, { dateFrom, dateTo });
  const { data: monthlyData, isLoading: monthlyLoading } = useAttendanceReport('monthly', undefined, { dateFrom, dateTo });

  const dailyColumns = [
    { key: 'date', header: 'Date', render: (s: any) => <span className="font-medium">{s.date}</span> },
    { key: 'batch', header: 'Batch', render: (s: any) => <span className="badge-primary">{s.batchName}</span> },
    { key: 'total', header: 'Total Students', render: (s: any) => s.totalStudents },
    { key: 'present', header: 'Present', render: (s: any) => <span className="text-success-600 font-medium">{s.present}</span> },
    { key: 'absent', header: 'Absent', render: (s: any) => <span className="text-danger-600 font-medium">{s.absent}</span> },
    { key: 'percentage', header: 'Percentage', render: (s: any) => <span className="font-bold">{s.percentage}%</span> },
  ];

  const monthlyColumns = [
    { key: 'date', header: 'Date', render: (s: any) => <span className="font-medium">{s.date}</span> },
    { key: 'total', header: 'Total Records', render: (s: any) => s.total },
    { key: 'present', header: 'Total Present', render: (s: any) => <span className="text-success-600 font-medium">{s.present}</span> },
    { key: 'absent', header: 'Total Absent', render: (s: any) => <span className="text-danger-600 font-medium">{s.absent}</span> },
    { key: 'percentage', header: 'Avg Percentage', render: (s: any) => <span className="font-bold">{s.percentage}%</span> },
  ];

  return (
    <div id="attendance-reports-page">
      <PageHeader title="Attendance Reports" description="Export and view detailed attendance analytics" />

      <div className="card p-4 mb-6 flex flex-wrap gap-4 items-end bg-white">
        <div>
          <label className="label text-xs">Date Range</label>
          <DateRangePicker startDate={dateFrom} endDate={dateTo} onChange={(start, end) => { setDateFrom(start); setDateTo(end); }} />
        </div>
      </div>

      <div className="mb-6">
        <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === 'daily' && (
        <DataTable columns={dailyColumns} data={dailyData || []} isLoading={dailyLoading} />
      )}

      {activeTab === 'monthly' && (
        <DataTable columns={monthlyColumns} data={monthlyData || []} isLoading={monthlyLoading} />
      )}
    </div>
  );
};
