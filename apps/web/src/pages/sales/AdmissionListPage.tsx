import React, { useState } from 'react';
import { useAdmissions, useSalesDashboardStats } from '@/hooks/useSales';
import { EnrollmentWizardModal } from './EnrollmentWizardModal';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Loader2,
  CheckCircle,
  GraduationCap,
  Percent,
  Search,
  Users,
  IndianRupee,
  AlertCircle,
} from 'lucide-react';

export const AdmissionListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  // Wizard modal state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState('');
  const [selectedStudentName, setSelectedStudentName] = useState('');

  const { data: stats, isLoading: loadingStats } = useSalesDashboardStats();
  const { data: admissionsRes, isLoading: loadingAdmissions } = useAdmissions({
    page,
    limit: 15,
    search,
    status: status || undefined,
    paymentStatus: paymentStatus || undefined,
  });

  const admissions = admissionsRes?.data || [];
  const meta = admissionsRes?.meta;

  const handleOpenWizard = (id: string, name: string) => {
    setSelectedAdmissionId(id);
    setSelectedStudentName(name);
    setWizardOpen(true);
  };

  const cards = [
    {
      title: "Today's Admissions",
      value: stats?.todaysAdmissions || 0,
      icon: Users,
      color: 'text-primary-700 bg-primary-50 border-primary-100',
    },
    {
      title: 'Revenue Collected',
      value: `₹${(stats?.revenue || 0).toLocaleString()}`,
      icon: IndianRupee,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Cancelled Admissions',
      value: stats?.cancelledCount || 0,
      icon: AlertCircle,
      color: 'text-red-700 bg-red-50 border-red-100',
    },
    {
      title: 'Conversion Rate',
      value: `${stats?.conversionRate || 0}%`,
      icon: Percent,
      color: 'text-amber-700 bg-amber-50 border-amber-100',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Management"
        description="Verify payments, process registration details, and convert approved admissions into Academic student accounts."
      />

      {/* Stats Cards Grid */}
      {loadingStats ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="animate-spin text-primary-600 h-6 w-6" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div key={idx} className={`card border p-4 flex items-center gap-4 bg-white rounded-xl shadow-sm ${c.color}`}>
                <div className="p-2.5 bg-white/80 rounded-lg shadow-sm border border-inherit">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{c.title}</p>
                  <h4 className="text-xl font-bold font-display text-gray-900 mt-0.5">{c.value}</h4>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters & Search */}
      <div className="card p-5 bg-white border border-gray-200 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative text-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search admission or enquiry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg text-xs"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONVERTED">Converted</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg text-xs"
        >
          <option value="">All Payments</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Admissions Table */}
      <div className="card bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loadingAdmissions ? (
          <div className="flex items-center justify-center min-h-[250px]">
            <Loader2 className="animate-spin text-primary-600 h-8 w-8" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Adm Number</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Course / Program</th>
                  <th className="p-4">Registration Fee</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {admissions.map((a: any) => (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-mono font-bold text-primary-800">{a.admissionNumber}</td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{a.enquiry.studentName}</div>
                      <div className="text-[10px] text-gray-400">Mob: {a.enquiry.mobile}</div>
                    </td>
                    <td className="p-4">
                      <div>{a.course || 'N/A'}</div>
                      <div className="text-[10px] text-gray-500">{a.program || 'N/A'}</div>
                    </td>
                    <td className="p-4 font-semibold text-gray-900">₹{(Number(a.registrationFee) || 0).toLocaleString()}</td>
                    <td className="p-4 text-red-600 font-medium">₹{(Number(a.discount || 0) + Number(a.scholarship || 0)).toLocaleString()}</td>
                    <td className="p-4">
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          a.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}
                      >
                        {a.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`badge text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          a.status === 'CONVERTED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : a.status === 'CANCELLED'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {a.status !== 'CONVERTED' && a.status !== 'CANCELLED' ? (
                        <button
                          onClick={() => handleOpenWizard(a.id, a.enquiry.studentName)}
                          className="btn btn-primary flex items-center gap-1 text-[10px] py-1 px-2.5 ml-auto"
                        >
                          <GraduationCap className="h-3.5 w-3.5" /> Enroll Student
                        </button>
                      ) : a.status === 'CONVERTED' ? (
                        <span className="text-emerald-600 font-bold flex items-center justify-end gap-1 text-[10px]">
                          <CheckCircle className="h-3.5 w-3.5" /> Enrolled
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
                {admissions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      No admissions created yet. Convert enquiries into admissions to list them here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-100">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 bg-white border rounded text-xs disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500">
              Page {meta.page} of {meta.totalPages} ({meta.total} total)
            </span>
            <button
              disabled={page === meta.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 bg-white border rounded text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Enrollment Wizard Modal Popup */}
      <EnrollmentWizardModal
        admissionId={selectedAdmissionId}
        studentName={selectedStudentName}
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  );
};
