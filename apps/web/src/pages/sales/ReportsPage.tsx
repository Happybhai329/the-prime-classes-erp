import React, { useState } from 'react';
import { useSalesReport } from '@/hooks/useSales';
import { PageHeader } from '@/components/ui/PageHeader';
import { Loader2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('daily-admissions');

  const { data: reportData, isLoading } = useSalesReport(activeTab);

  const tabs = [
    { id: 'daily-admissions', label: 'Daily Admissions' },
    { id: 'monthly-admissions', label: 'Monthly Admissions' },
    { id: 'counsellor-performance', label: 'Counsellor Performance' },
    { id: 'lead-source', label: 'Lead Sources' },
    { id: 'conversion', label: 'Conversion Funnel' },
    { id: 'revenue', label: 'Revenue Report' },
    { id: 'cancelled', label: 'Cancelled Admissions' },
    { id: 'pending', label: 'Pending Admissions' },
    { id: 'scholarships', label: 'Scholarships' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales & CRM Reports"
        description="Access and download detailed reports for daily/monthly admissions, lead sources, revenue breakdowns, and counsellor targets."
      />

      {/* Tabs list */}
      <div className="flex flex-wrap gap-1.5 border-b border-gray-200 pb-px text-xs font-semibold">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 -mb-px rounded-t-lg border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-700 bg-primary-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Data display */}
      <div className="card p-6 bg-white border border-gray-200 rounded-xl shadow-sm min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="animate-spin text-primary-600 h-6 w-6" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Daily & Monthly Admissions Table */}
            {(activeTab === 'daily-admissions' || activeTab === 'monthly-admissions') && (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-semibold pb-2">
                      <th className="pb-3">Admission Number</th>
                      <th className="pb-3">Student Name</th>
                      <th className="pb-3">Class</th>
                      <th className="pb-3 text-center">Registration Fee</th>
                      <th className="pb-3 text-center">Payment Status</th>
                      <th className="pb-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {(reportData || []).map((row: any) => (
                      <tr key={row.id}>
                        <td className="py-3 font-mono font-bold text-primary-800">{row.admissionNumber}</td>
                        <td className="py-3 font-medium">{row.enquiry.studentName}</td>
                        <td className="py-3">{row.course || 'N/A'}</td>
                        <td className="py-3 text-center font-semibold">₹{(Number(row.registrationFee) || 0).toLocaleString()}</td>
                        <td className="py-3 text-center">
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${row.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {row.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right">{new Date(row.admissionDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {(reportData || []).length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">No admissions registered for this period.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Counsellor Performance Report Table */}
            {activeTab === 'counsellor-performance' && (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-semibold pb-2">
                      <th className="pb-3">Counsellor Name</th>
                      <th className="pb-3 text-center">Total Enquiries</th>
                      <th className="pb-3 text-center">Admissions Made</th>
                      <th className="pb-3 text-center">Target Admissions</th>
                      <th className="pb-3 text-center">Revenue Generated</th>
                      <th className="pb-3 text-right">Revenue Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {(reportData || []).map((row: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-3 font-medium">{row.counsellorName}</td>
                        <td className="py-3 text-center">{row.totalEnquiries}</td>
                        <td className="py-3 text-center font-semibold text-emerald-600">{row.admissions}</td>
                        <td className="py-3 text-center text-gray-500">{row.targetAdmissions}</td>
                        <td className="py-3 text-center font-bold text-primary-700">₹{(row.revenue || 0).toLocaleString()}</td>
                        <td className="py-3 text-right text-gray-500">₹{(row.targetRevenue || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Lead Source Report Table */}
            {activeTab === 'lead-source' && (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-semibold pb-2">
                      <th className="pb-3">Lead Source</th>
                      <th className="pb-3 text-center">Total Enquiries</th>
                      <th className="pb-3 text-center">Admissions Closed</th>
                      <th className="pb-3 text-right">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {(reportData || []).map((row: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-3 font-medium">{row.source}</td>
                        <td className="py-3 text-center">{row.enquiries}</td>
                        <td className="py-3 text-center font-semibold">{row.admissions}</td>
                        <td className="py-3 text-right font-bold text-emerald-600">{row.conversionRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Conversion Report Cards */}
            {activeTab === 'conversion' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Enquiry → Admission</h4>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{reportData?.enquiryToAdmissionRate}%</p>
                  <p className="text-gray-500 mt-0.5">{reportData?.totalAdmissions} admissions from {reportData?.totalEnquiries} enquiries</p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Admission → Enrollment</h4>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{reportData?.admissionToEnrollmentRate}%</p>
                  <p className="text-gray-500 mt-0.5">{reportData?.enrolledCount} enrolled into academic from {reportData?.totalAdmissions} admissions</p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Overall Conversion</h4>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{reportData?.overallConversionRate}%</p>
                  <p className="text-gray-500 mt-0.5">{reportData?.enrolledCount} active students from {reportData?.totalEnquiries} enquiries</p>
                </div>
              </div>
            )}

            {/* Revenue Report Details */}
            {activeTab === 'revenue' && (
              <div className="space-y-6 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Gross Revenue</h4>
                    <p className="text-2xl font-bold text-primary-700 mt-1">₹{(reportData?.totalRevenue || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Discounts Given</h4>
                    <p className="text-2xl font-bold text-red-600 mt-1">₹{(reportData?.totalDiscount || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Scholarships Disbursed</h4>
                    <p className="text-2xl font-bold text-blue-600 mt-1">₹{(reportData?.totalScholarship || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-sm">Monthly Revenue Breakdown</h4>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500 font-semibold pb-1">
                        <th className="pb-2">Month</th>
                        <th className="pb-2 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {(reportData?.monthlyRevenue || []).map((row: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-2">{row.month}</td>
                          <td className="py-2 text-right font-bold text-gray-900">₹{(row.amount || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Cancelled & Pending Admissions */}
            {(activeTab === 'cancelled' || activeTab === 'pending') && (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-semibold pb-2">
                      <th className="pb-3">Admission Number</th>
                      <th className="pb-3">Student Name</th>
                      <th className="pb-3">Class</th>
                      <th className="pb-3 text-center">Registration Fee</th>
                      <th className="pb-3 text-right">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {(reportData || []).map((row: any) => (
                      <tr key={row.id}>
                        <td className="py-3 font-mono font-bold text-primary-800">{row.admissionNumber}</td>
                        <td className="py-3 font-medium">{row.enquiry.studentName}</td>
                        <td className="py-3">{row.course || 'N/A'}</td>
                        <td className="py-3 text-center">₹{(Number(row.registrationFee) || 0).toLocaleString()}</td>
                        <td className="py-3 text-right">{new Date(row.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {(reportData || []).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">No records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Scholarships Report */}
            {activeTab === 'scholarships' && (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-semibold pb-2">
                      <th className="pb-3">Admission Number</th>
                      <th className="pb-3">Student Name</th>
                      <th className="pb-3">Class</th>
                      <th className="pb-3 text-center">Registration Fee</th>
                      <th className="pb-3 text-right">Scholarship Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {(reportData || []).map((row: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-3 font-mono font-bold text-primary-800">{row.admissionNumber}</td>
                        <td className="py-3 font-medium">{row.studentName}</td>
                        <td className="py-3">{row.class}</td>
                        <td className="py-3 text-center">₹{row.registrationFee.toLocaleString()}</td>
                        <td className="py-3 text-right font-bold text-emerald-600">₹{row.scholarshipAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                    {(reportData || []).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">No scholarship records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
