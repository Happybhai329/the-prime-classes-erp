import React, { useState, useMemo } from 'react';
import { useAttendanceReport, useAttendanceAnalytics } from '@/hooks/useAttendance';
import { useBatches } from '@/hooks/useBatches';
import { PageHeader } from '@/components/ui/PageHeader';
import { TabGroup } from '@/components/ui/TabGroup';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { DataTable } from '@/components/ui/DataTable';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { Button } from '@/components/ui/Button';
import { Download, Printer, TrendingUp, Users, AlertTriangle, ShieldCheck } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';

const tabs = [
  { id: 'daily', label: 'Daily Summary' },
  { id: 'weekly', label: 'Weekly Summary' },
  { id: 'monthly', label: 'Monthly Summary' },
];

function getMonday(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export const AttendanceReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [batchId, setBatchId] = useState('');
  
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30); // Last 30 days
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  // Fetch batches for filter
  const { data: batchesData } = useBatches({ limit: 100 });
  const batches = batchesData?.data || [];

  // Fetch reports data
  const reportParams = { dateFrom, dateTo, batchId: batchId || undefined };
  const { data: dailyData, isLoading: dailyLoading } = useAttendanceReport('daily', undefined, reportParams);
  const { data: monthlyData, isLoading: monthlyLoading } = useAttendanceReport('monthly', undefined, reportParams);
  const { data: analyticsData, isLoading: _analyticsLoading } = useAttendanceAnalytics(reportParams);

  // Compute Weekly Summary from Daily Data grouped by ISO Week (Monday)
  const weeklyData = useMemo(() => {
    const dailyList = dailyData || [];
    const groups: Record<string, any> = {};

    dailyList.forEach((item: any) => {
      const mondayKey = getMonday(item.date);
      if (!groups[mondayKey]) {
        groups[mondayKey] = {
          week: mondayKey,
          totalStudents: 0,
          present: 0,
          absent: 0,
          count: 0,
        };
      }
      groups[mondayKey].totalStudents += item.totalStudents;
      groups[mondayKey].present += item.present;
      groups[mondayKey].absent += item.absent;
      groups[mondayKey].count += 1;
    });

    return Object.values(groups).map((g: any) => {
      const total = g.totalStudents;
      const present = g.present;
      const absent = g.absent;
      return {
        date: `Week of ${new Date(g.week).toLocaleDateString()}`,
        total,
        present,
        absent,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      };
    });
  }, [dailyData]);

  // Total summary calculations
  const totalSessions = dailyData?.length || 0;
  const avgAttendance = analyticsData?.overallPercentage || 0;
  const topDefaulters = analyticsData?.topDefaulters || [];
  const perfectAttendanceCount = analyticsData?.perfectAttendance?.length || 0;

  // Chart computations
  const chartData = useMemo(() => {
    const daily = dailyData || [];
    // Take last 7 data points for clean bar chart visualization
    return [...daily].reverse().slice(-7).map((d: any) => ({
      label: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: d.percentage,
    }));
  }, [dailyData]);

  // Pie chart variables
  const pieMetrics = useMemo(() => {
    const daily = dailyData || [];
    let totalPresent = 0;
    let totalAbsent = 0;
    daily.forEach((d: any) => {
      totalPresent += d.present;
      totalAbsent += d.absent;
    });
    const total = totalPresent + totalAbsent;
    const presentPct = total > 0 ? Math.round((totalPresent / total) * 100) : 0;
    const absentPct = total > 0 ? 100 - presentPct : 0;

    // SVG stroke calculations for 100 radius circle (circumference = 2 * PI * r = 2 * 3.14159 * 40 = 251.3)
    const circ = 251.3;
    const strokeDash = circ;
    const strokeOffset = circ - (presentPct / 100) * circ;

    return {
      totalPresent,
      totalAbsent,
      presentPct,
      absentPct,
      strokeDash,
      strokeOffset,
    };
  }, [dailyData]);

  const dailyColumns = [
    { key: 'date', header: 'Date', render: (s: any) => <span className="font-semibold text-gray-900">{s.date}</span> },
    { key: 'batch', header: 'Batch', render: (s: any) => <span className="badge-primary">{s.batchName}</span> },
    { key: 'total', header: 'Total Students', render: (s: any) => s.totalStudents },
    { key: 'present', header: 'Present', render: (s: any) => <span className="text-emerald-600 font-semibold">{s.present}</span> },
    { key: 'absent', header: 'Absent', render: (s: any) => <span className="text-rose-600 font-semibold">{s.absent}</span> },
    { key: 'percentage', header: 'Percentage', render: (s: any) => <span className="font-bold text-gray-900">{s.percentage}%</span> },
  ];

  const weeklyColumns = [
    { key: 'date', header: 'Week of', render: (s: any) => <span className="font-semibold text-gray-900">{s.date}</span> },
    { key: 'total', header: 'Total Records', render: (s: any) => s.total },
    { key: 'present', header: 'Present Records', render: (s: any) => <span className="text-emerald-600 font-semibold">{s.present}</span> },
    { key: 'absent', header: 'Absent Records', render: (s: any) => <span className="text-rose-600 font-semibold">{s.absent}</span> },
    { key: 'percentage', header: 'Avg Percentage', render: (s: any) => <span className="font-bold text-gray-900">{s.percentage}%</span> },
  ];

  const monthlyColumns = [
    { key: 'date', header: 'Month', render: (s: any) => <span className="font-semibold text-gray-900">{s.date}</span> },
    { key: 'total', header: 'Total Records', render: (s: any) => s.total },
    { key: 'present', header: 'Total Present', render: (s: any) => <span className="text-emerald-600 font-semibold">{s.present}</span> },
    { key: 'absent', header: 'Total Absent', render: (s: any) => <span className="text-rose-600 font-semibold">{s.absent}</span> },
    { key: 'percentage', header: 'Avg Percentage', render: (s: any) => <span className="font-bold text-gray-900">{s.percentage}%</span> },
  ];

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = '';

    if (activeTab === 'daily') {
      headers = ['Date', 'Batch', 'Total Students', 'Present', 'Absent', 'Percentage'];
      rows = (dailyData || []).map((s: any) => [s.date, s.batchName, s.totalStudents, s.present, s.absent, `${s.percentage}%`]);
      filename = 'daily_attendance_report.csv';
    } else if (activeTab === 'weekly') {
      headers = ['Week', 'Total Records', 'Present Records', 'Absent Records', 'Percentage'];
      rows = weeklyData.map((s: any) => [s.date, s.total, s.present, s.absent, `${s.percentage}%`]);
      filename = 'weekly_attendance_report.csv';
    } else {
      headers = ['Month', 'Total Records', 'Present Records', 'Absent Records', 'Percentage'];
      rows = (monthlyData || []).map((s: any) => [s.date, s.total, s.present, s.absent, `${s.percentage}%`]);
      filename = 'monthly_attendance_report.csv';
    }

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

  return (
    <div id="attendance-reports-page" className="space-y-6">
      {/* Print-only CSS style injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #attendance-reports-page, #attendance-reports-page * {
            visibility: visible;
          }
          #attendance-reports-page {
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
          .grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      `}} />

      <PageHeader 
        title="Attendance Reports" 
        description="View granular attendance summaries, check charts, and track student statistics" 
        actions={
          <div className="flex flex-wrap gap-2 no-print">
            <Button variant="secondary" onClick={handleExportCSV} className="flex items-center gap-2 text-xs sm:text-sm">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="secondary" onClick={handleExportPDF} className="flex items-center gap-2 text-xs sm:text-sm">
              <Printer className="h-4 w-4" /> Print PDF
            </Button>
          </div>
        }
      />

      {/* Filter toolbar */}
      <div className="card p-4 flex flex-wrap gap-4 items-center justify-between bg-white border border-gray-200 rounded-xl shadow-sm no-print">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="label text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Date Range</label>
            <DateRangePicker 
              startDate={dateFrom} 
              endDate={dateTo} 
              onChange={(start, end) => { setDateFrom(start); setDateTo(end); }} 
            />
          </div>
          <div>
            <label className="label text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Batch</label>
            <FilterDropdown 
              label="All Batches" 
              value={batchId} 
              onChange={(val) => setBatchId(val || '')} 
              options={batches.map((b: any) => ({ label: b.name, value: b.id }))} 
            />
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Sessions"
          value={totalSessions}
          icon={TrendingUp}
          iconClassName="text-primary-600 bg-primary-55"
        />
        <StatCard
          title="Avg Attendance"
          value={`${avgAttendance}%`}
          icon={Users}
          iconClassName="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          title="Perfect Attendance"
          value={perfectAttendanceCount}
          icon={ShieldCheck}
          iconClassName="text-blue-600 bg-blue-50"
        />
        <StatCard
          title="Top Defaulters"
          value={topDefaulters.length}
          icon={AlertTriangle}
          iconClassName="text-rose-600 bg-rose-50"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        {/* Bar Chart SVG */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-80">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Daily Attendance Trend (Last 7 Sessions)</h3>
          {chartData.length > 0 ? (
            <div className="relative flex items-end justify-between h-48 px-2 border-b border-gray-200">
              {chartData.map((d, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  {/* Tooltip */}
                  <span className="absolute bottom-full mb-2 bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.value}%
                  </span>
                  <div 
                    className="w-8 bg-primary-500 hover:bg-primary-600 rounded-t transition-all"
                    style={{ height: `${(d.value / 100) * 140}px` }}
                  />
                  <span className="text-[9px] text-gray-500 mt-2 rotate-12 text-center whitespace-nowrap">{d.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-xs text-gray-400">No trend data available</div>
          )}
        </div>

        {/* Pie Chart SVG */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-80">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Overall Presence Distribution</h3>
          {pieMetrics.totalPresent + pieMetrics.totalAbsent > 0 ? (
            <div className="flex items-center justify-around h-48">
              {/* SVG Donut */}
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="12" />
                  {/* Progress Circle */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    stroke="#10b981" 
                    strokeWidth="12" 
                    strokeDasharray={pieMetrics.strokeDash}
                    strokeDashoffset={pieMetrics.strokeOffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-gray-800">{pieMetrics.presentPct}%</span>
                  <span className="text-[10px] text-gray-400 font-medium">Present</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <div>
                    <span className="block text-xs font-semibold text-gray-700">Present</span>
                    <span className="text-[10px] text-gray-400">{pieMetrics.totalPresent} records ({pieMetrics.presentPct}%)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                  <div>
                    <span className="block text-xs font-semibold text-gray-700">Absent</span>
                    <span className="text-[10px] text-gray-400">{pieMetrics.totalAbsent} records ({pieMetrics.absentPct}%)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-xs text-gray-400">No distribution data available</div>
          )}
        </div>

        {/* Defaulters Panel */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-80 overflow-hidden">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Top Defaulters (&lt;85% Attendance)
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {topDefaulters.slice(0, 4).map((d: any) => (
              <div key={d.studentId} className="flex items-center justify-between p-2.5 bg-rose-50/50 border border-rose-100 rounded-lg">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{d.studentName}</h4>
                  <span className="text-[10px] text-gray-500">Roll: {d.rollNumber} · {d.batchName}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-rose-600">{d.percentage}%</span>
                  <span className="block text-[9px] text-gray-400">Absences: {d.absentCount}</span>
                </div>
              </div>
            ))}
            {topDefaulters.length === 0 && (
              <div className="flex items-center justify-center h-40 text-xs text-gray-400 italic">No defaulters flagged. Great job!</div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs and Data Tables */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-150 px-4 pt-4 bg-gray-50/50 no-print">
          <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="p-1">
          {activeTab === 'daily' && (
            <DataTable 
              columns={dailyColumns} 
              data={dailyData || []} 
              isLoading={dailyLoading} 
              emptyTitle="No daily report data"
              emptyDescription="No attendance sessions were marked for the selected filters."
            />
          )}

          {activeTab === 'weekly' && (
            <DataTable 
              columns={weeklyColumns} 
              data={weeklyData} 
              isLoading={dailyLoading} 
              emptyTitle="No weekly report data"
              emptyDescription="Grouped weekly stats are empty."
            />
          )}

          {activeTab === 'monthly' && (
            <DataTable 
              columns={monthlyColumns} 
              data={monthlyData || []} 
              isLoading={monthlyLoading} 
              emptyTitle="No monthly report data"
              emptyDescription="Monthly stats are empty."
            />
          )}
        </div>
      </div>
    </div>
  );
};
