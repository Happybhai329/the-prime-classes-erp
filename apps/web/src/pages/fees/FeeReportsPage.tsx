import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Search } from 'lucide-react';
import { useStudents } from '@/hooks/useStudents';
import {
  useDailyCollectionReport,
  useMonthlyCollectionReport,
  useStudentLedgerReport,
  useOutstandingReport,
} from '@/hooks/useFees';
import { PageHeader } from '@/components/ui/PageHeader';
import { TabGroup } from '@/components/ui/TabGroup';
import { Button } from '@/components/ui/Button';

export const FeeReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialStudentId = searchParams.get('studentId') || '';

  const [activeReport, setActiveReport] = useState('daily');
  
  // Daily Filter
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Monthly Filters
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Student Ledger Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId);

  // Queries
  const { data: studentsData } = useStudents({ search: studentSearch, limit: 10 });
  
  const { data: dailyData, isLoading: dailyLoading } = useDailyCollectionReport({ date: dailyDate });
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyCollectionReport({ month: selectedMonth, year: selectedYear });
  const { data: ledgerData, isLoading: ledgerLoading } = useStudentLedgerReport(selectedStudentId);
  const { data: outstandingData, isLoading: outstandingLoading } = useOutstandingReport({ academicYear: '2026-27' });

  // If initialStudentId is passed in query, open ledger tab automatically
  useEffect(() => {
    if (initialStudentId) {
      setActiveReport('ledger');
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId]);

  // If student is loaded, pre-fill search input
  useEffect(() => {
    if (ledgerData?.student) {
      setStudentSearch(ledgerData.student.name);
    }
  }, [ledgerData]);

  // Client-side CSV Exporter helper
  const downloadCsv = (filename: string, rows: string[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDaily = () => {
    if (!dailyData?.transactions) return;
    const headers = ["Receipt Number", "Student Name", "Roll Number", "Amount Paid (INR)", "Payment Date", "Payment Mode", "Transaction ID", "Remarks"];
    const rows = dailyData.transactions.map((t: any) => [
      t.receiptNumber,
      t.studentName,
      t.rollNumber,
      t.amountPaid.toString(),
      t.paymentDate,
      t.paymentMode,
      t.transactionId || '',
      t.notes || '',
    ]);
    downloadCsv(`daily_collection_${dailyDate}.csv`, [headers, ...rows]);
  };

  const handleExportMonthly = () => {
    if (!monthlyData?.dailyBreakdown) return;
    const headers = ["Date", "Collection Amount (INR)"];
    const rows = monthlyData.dailyBreakdown.map((d: any) => [d.date, d.amount.toString()]);
    downloadCsv(`monthly_collection_${selectedYear}_${selectedMonth}.csv`, [headers, ...rows]);
  };

  const handleExportOutstanding = () => {
    if (!outstandingData?.students) return;
    const headers = ["Student Name", "Roll Number", "Batch Name", "Outstanding Balance (INR)", "Last Payment Date", "Next Due Date"];
    const rows = outstandingData.students.map((s: any) => [
      s.studentName,
      s.rollNumber,
      s.batchName,
      s.outstanding.toString(),
      s.lastPaymentDate || 'None',
      s.nextDueDate || 'None',
    ]);
    downloadCsv(`outstanding_fees_report.csv`, [headers, ...rows]);
  };

  const handleExportLedger = () => {
    if (!ledgerData?.entries) return;
    const headers = ["Entry Date", "Description", "Type", "Debit (INR)", "Credit (INR)", "Running Balance (INR)"];
    const rows = ledgerData.entries.map((e: any) => [
      e.date,
      e.description,
      e.type,
      e.debit.toString(),
      e.credit.toString(),
      e.balance.toString(),
    ]);
    downloadCsv(`ledger_${ledgerData.student.rollNumber}.csv`, [headers, ...rows]);
  };

  return (
    <div id="fee-reports-page" className="space-y-6">
      <PageHeader
        title="Revenue & Audit Reports"
        description="Audit ledger statements, view daily collection tallies, and export outstanding lists."
      />

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <TabGroup
          tabs={[
            { id: 'daily', label: 'Daily Tally' },
            { id: 'monthly', label: 'Monthly Breakdown' },
            { id: 'outstanding', label: 'Outstanding Balance' },
            { id: 'ledger', label: 'Student Ledger' },
          ]}
          activeTab={activeReport}
          onChange={setActiveReport}
        />

        <div className="mt-6">
          {/* DAILY COLLECTION REPORT */}
          {activeReport === 'daily' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 items-end justify-between border-b pb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Select Tally Date</label>
                  <input
                    type="date"
                    value={dailyDate}
                    onChange={(e) => setDailyDate(e.target.value)}
                    className="input text-sm"
                  />
                </div>
                <Button onClick={handleExportDaily} disabled={!dailyData?.transactions?.length} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Tally CSV
                </Button>
              </div>

              {dailyLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : dailyData ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Total Collection</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">₹{Number(dailyData.totalCollected).toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Transaction Tally</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{dailyData.totalTransactions} collections</p>
                    </div>
                  </div>

                  {/* Mode Breakdown */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tally by Payment Mode</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {dailyData.byPaymentMode.map((m: any) => (
                        <div key={m.mode} className="border p-3 rounded-lg text-center bg-white shadow-xs">
                          <p className="text-xs text-gray-500 font-medium">{m.mode}</p>
                          <p className="text-base font-bold text-gray-800 mt-1">₹{Number(m.amount).toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{m.count} txns</p>
                        </div>
                      ))}
                      {dailyData.byPaymentMode.length === 0 && (
                        <p className="text-xs text-gray-500 col-span-full py-2 bg-gray-50 rounded text-center">No modes recorded today.</p>
                      )}
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tally Transaction Details</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Receipt</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Student Name</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Roll Number</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Mode</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Ref ID</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {dailyData.transactions.map((t: any) => (
                            <tr key={t.id}>
                              <td className="px-4 py-2 font-medium">{t.receiptNumber}</td>
                              <td className="px-4 py-2">{t.studentName}</td>
                              <td className="px-4 py-2 font-mono">{t.rollNumber}</td>
                              <td className="px-4 py-2">{t.paymentMode}</td>
                              <td className="px-4 py-2 font-mono text-[10px] text-gray-400">{t.transactionId || '—'}</td>
                              <td className="px-4 py-2 font-bold text-gray-800">₹{Number(t.amountPaid).toLocaleString()}</td>
                            </tr>
                          ))}
                          {dailyData.transactions.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-6 text-gray-400">No collections for selected date.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* MONTHLY SUMMARY REPORT */}
          {activeReport === 'monthly' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 items-end justify-between border-b pb-4">
                <div className="flex gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Select Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="select select-sm text-xs"
                    >
                      {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2000, i, 1).toLocaleDateString('en-US', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Select Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="select select-sm text-xs"
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleExportMonthly} disabled={!monthlyData?.dailyBreakdown?.length} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Monthly CSV
                </Button>
              </div>

              {monthlyLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : monthlyData ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Total Monthly Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">₹{Number(monthlyData.totalCollected).toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Monthly Volume</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{monthlyData.totalTransactions} transactions</p>
                    </div>
                  </div>

                  {/* Mode Breakdown */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tally by Payment Mode</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {monthlyData.byPaymentMode.map((m: any) => (
                        <div key={m.mode} className="border p-3 rounded-lg text-center bg-white shadow-xs">
                          <p className="text-xs text-gray-500 font-medium">{m.mode}</p>
                          <p className="text-base font-bold text-gray-800 mt-1">₹{Number(m.amount).toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{m.count} txns</p>
                        </div>
                      ))}
                      {monthlyData.byPaymentMode.length === 0 && (
                        <p className="text-xs text-gray-500 col-span-full py-2 bg-gray-50 rounded text-center">No modes recorded this month.</p>
                      )}
                    </div>
                  </div>

                  {/* Daily Tally Breakdowns */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Daily Collection Breakdown</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Date</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Tally Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {monthlyData.dailyBreakdown.map((d: any) => (
                            <tr key={d.date}>
                              <td className="px-4 py-2 font-medium">{d.date}</td>
                              <td className="px-4 py-2 font-bold text-indigo-700">₹{Number(d.amount).toLocaleString()}</td>
                            </tr>
                          ))}
                          {monthlyData.dailyBreakdown.length === 0 && (
                            <tr>
                              <td colSpan={2} className="text-center py-6 text-gray-400">No collection details found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* OUTSTANDING BALANCE REPORT */}
          {activeReport === 'outstanding' && (
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b pb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Defaulters & Outstanding Balances</h3>
                  <p className="text-xs text-gray-500 mt-1">Academic Year: 2026-27</p>
                </div>
                <Button onClick={handleExportOutstanding} disabled={!outstandingData?.students?.length} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Defaulters CSV
                </Button>
              </div>

              {outstandingLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : outstandingData ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Total Outstanding</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">₹{Number(outstandingData.totalOutstanding).toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Overdue Amount</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">₹{Number(outstandingData.overdueAmount).toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Upcoming Due</p>
                      <p className="text-2xl font-bold text-indigo-700 mt-1">₹{Number(outstandingData.upcomingDues).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Batch Summary */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Outstanding Tally by Batch</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Batch Name</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Students with Due</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Outstanding Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {outstandingData.byBatch.map((b: any) => (
                            <tr key={b.batchId}>
                              <td className="px-4 py-2 font-medium">{b.batchName}</td>
                              <td className="px-4 py-2">{b.studentCount} students</td>
                              <td className="px-4 py-2 font-bold text-gray-800">₹{Number(b.outstanding).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Defaulters List */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Student Outstanding Details</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Student Name</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Roll #</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Batch Name</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Last Payment</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Next Due Date</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Outstanding</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {outstandingData.students.map((s: any) => (
                            <tr key={s.studentId}>
                              <td className="px-4 py-2 font-semibold text-gray-900">{s.studentName}</td>
                              <td className="px-4 py-2 font-mono">{s.rollNumber}</td>
                              <td className="px-4 py-2">{s.batchName}</td>
                              <td className="px-4 py-2 text-gray-500">{s.lastPaymentDate || 'Never'}</td>
                              <td className="px-4 py-2 font-medium text-amber-700">{s.nextDueDate || 'None'}</td>
                              <td className="px-4 py-2 font-bold text-red-600">₹{Number(s.outstanding).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* STUDENT FEE LEDGER */}
          {activeReport === 'ledger' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 items-end justify-between border-b pb-4">
                <div className="relative flex-1 max-w-sm">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Search & Select Student</label>
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      if (selectedStudentId) setSelectedStudentId('');
                    }}
                    className="input w-full pl-8 text-sm"
                    placeholder="Search by name or roll number..."
                  />
                  <Search className="absolute left-2.5 top-7.5 h-4 w-4 text-gray-400" />

                  {studentSearch && !selectedStudentId && studentsData?.data && studentsData.data.length > 0 && (
                    <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y">
                      {studentsData.data.map((s: any) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(s.id);
                            setStudentSearch(`${s.firstName} ${s.lastName}`);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 transition text-xs flex justify-between"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">{s.firstName} {s.lastName}</p>
                            <p className="text-gray-500 font-mono">Roll: {s.rollNumber}</p>
                          </div>
                          <span className="text-[10px] text-indigo-600 font-semibold align-self-center">Select</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={handleExportLedger} disabled={!ledgerData?.entries?.length} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Ledger CSV
                </Button>
              </div>

              {selectedStudentId ? (
                ledgerLoading ? (
                  <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : ledgerData ? (
                  <div className="space-y-6">
                    {/* Header info */}
                    <div className="flex justify-between items-start bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">{ledgerData.student.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">Roll Number: {ledgerData.student.rollNumber} | Batch: {ledgerData.student.batchName || 'Unassigned'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">Net Balance Due</span>
                        <span className={`text-xl font-black ${Number(ledgerData.balance) > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                          ₹{Number(ledgerData.balance).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Program Fee</span>
                        <span className="text-base font-bold text-gray-800 mt-1 block">₹{Number(ledgerData.totalFee).toLocaleString()}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Scholarships</span>
                        <span className="text-base font-bold text-emerald-600 mt-1 block">-₹{Number(ledgerData.totalDiscount).toLocaleString()}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Net Payable</span>
                        <span className="text-base font-bold text-gray-800 mt-1 block">₹{Number(ledgerData.netFee).toLocaleString()}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Amount Paid</span>
                        <span className="text-base font-bold text-emerald-700 mt-1 block">₹{Number(ledgerData.totalPaid).toLocaleString()}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Total Refunded</span>
                        <span className="text-base font-bold text-rose-600 mt-1 block">₹{Number(ledgerData.totalRefund).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Ledger Entries */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Audit Tally Ledger Ledger</h4>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Date</th>
                              <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Tally Description</th>
                              <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Type</th>
                              <th className="px-4 py-2.5 text-right font-semibold text-gray-700">Debit (Charges)</th>
                              <th className="px-4 py-2.5 text-right font-semibold text-gray-700">Credit (Payments)</th>
                              <th className="px-4 py-2.5 text-right font-semibold text-gray-700">Running Balance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {ledgerData.entries.map((e: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-600">{e.date}</td>
                                <td className="px-4 py-2.5 font-medium text-gray-800">{e.description}</td>
                                <td className="px-4 py-2.5">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    e.type === 'FEE' ? 'bg-indigo-50 text-indigo-700' :
                                    e.type === 'DISCOUNT' ? 'bg-emerald-50 text-emerald-700' :
                                    e.type === 'PAYMENT' ? 'bg-emerald-50 text-emerald-700' :
                                    'bg-rose-50 text-rose-700'
                                  }`}>
                                    {e.type}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-right text-gray-900 font-medium">{e.debit > 0 ? `₹${Number(e.debit).toLocaleString()}` : '—'}</td>
                                <td className="px-4 py-2.5 text-right text-emerald-700 font-semibold">{e.credit > 0 ? `₹${Number(e.credit).toLocaleString()}` : '—'}</td>
                                <td className="px-4 py-2.5 text-right font-bold text-gray-900">₹{Number(e.balance).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : null
              ) : (
                <div className="p-8 border border-dashed rounded-lg text-center text-gray-500 bg-gray-50 text-sm">
                  Please search and select a student above to audit and load their ledger statement.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
