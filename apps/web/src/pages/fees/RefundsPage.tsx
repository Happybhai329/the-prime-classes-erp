import React, { useState } from 'react';
import { Check, X, RefreshCcw, Info } from 'lucide-react';
import { useRefunds, useUpdateRefundStatus } from '@/hooks/useFees';
import { PageHeader } from '@/components/ui/PageHeader';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const RefundsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>();

  const { data: refunds, isLoading } = useRefunds({
    page,
    limit: 20,
    status,
  });

  const updateStatusMutation = useUpdateRefundStatus();

  const handleUpdateStatus = (id: string, newStatus: 'APPROVED' | 'REJECTED' | 'PROCESSED') => {
    updateStatusMutation.mutate({
      id,
      data: { status: newStatus },
    });
  };

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (r: any) => (
        <div>
          <p className="font-semibold text-gray-900">
            {r.studentFee?.student?.firstName} {r.studentFee?.student?.lastName}
          </p>
          <p className="text-xs text-gray-500">Roll: {r.studentFee?.student?.rollNumber}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Refund Amount',
      render: (r: any) => (
        <span className="font-bold text-gray-900 text-sm">
          ₹{Number(r.amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Justification Reason',
      render: (r: any) => (
        <span className="text-xs text-gray-600 block max-w-xs truncate" title={r.reason}>
          {r.reason}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: any) => <StatusBadge status={r.status} />,
    },
    {
      key: 'createdAt',
      header: 'Request Date',
      render: (r: any) => <span className="text-xs text-gray-500">{r.createdAt.split('T')[0]}</span>,
    },
    {
      key: 'actions',
      header: 'Workflow Controls',
      className: 'w-48',
      render: (r: any) => {
        if (r.status === 'PENDING') {
          return (
            <div className="flex gap-1">
              <button
                onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                className="btn-secondary py-1 px-2.5 text-[10px] rounded font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                Approve
              </button>
              <button
                onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                className="btn-secondary py-1 px-2.5 text-[10px] rounded font-semibold text-red-700 border-red-300 hover:bg-red-50 flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Reject
              </button>
            </div>
          );
        }

        if (r.status === 'APPROVED') {
          return (
            <button
              onClick={() => handleUpdateStatus(r.id, 'PROCESSED')}
              className="btn-primary py-1 px-2.5 text-[10px] rounded font-semibold flex items-center gap-1"
            >
              <RefreshCcw className="h-3 w-3" />
              Process Refund
            </button>
          );
        }

        return <span className="text-xs text-gray-400 font-medium">No actions pending</span>;
      },
    },
  ];

  const statusOptions = [
    { value: 'PENDING', label: 'Pending Approval' },
    { value: 'APPROVED', label: 'Approved (Unpaid)' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'PROCESSED', label: 'Processed (Paid Out)' },
  ];

  return (
    <div id="refunds-page" className="space-y-6">
      <PageHeader
        title="Refund Management"
        description="Process fee return requests, review justifications, and manage payout workflows."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <FilterDropdown
          label="Refund Status"
          options={statusOptions}
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
        />
      </div>

      <div className="bg-indigo-50 p-4 rounded-xl text-xs text-indigo-800 flex gap-3 mb-4">
        <Info className="h-5 w-5 shrink-0 text-indigo-500" />
        <div>
          <p className="font-semibold text-sm">Refund Payout Integrity</p>
          <p className="mt-1">
            Approving a refund reserves the request. Clicking <strong>Process Refund</strong> actually executes the return, updating the student paid balance and debiting it from dashboard metrics.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={refunds?.data || []}
        isLoading={isLoading}
        emptyTitle="No Refund Requests"
        emptyDescription="All accounts are currently in balance."
      />

      {refunds?.meta && (
        <Pagination
          page={refunds.meta.page}
          totalPages={refunds.meta.totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
      )}
    </div>
  );
};
