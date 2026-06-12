import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  useStudentFees,
  useApplyDiscount,
  useCreateRefund,
} from '@/hooks/useFees';
import { useBatches } from '@/hooks/useBatches';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DiscountType, DiscountMode } from '@prime/shared-types';

export const StudentFeesPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [batchId, setBatchId] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [academicYear] = useState<string | undefined>('2026-27');

  // Modal States
  const [discountModalSf, setDiscountModalSf] = useState<any | null>(null);
  const [refundModalSf, setRefundModalSf] = useState<any | null>(null);

  const { data: assignments, isLoading } = useStudentFees({
    page,
    limit: 20,
    search,
    batchId,
    status,
    academicYear,
  });

  const { data: batches } = useBatches({ limit: 100 });
  
  const applyDiscountMutation = useApplyDiscount();
  const createRefundMutation = useCreateRefund();

  const { register: registerDiscount, handleSubmit: handleDiscountSubmit, reset: resetDiscount } = useForm<{
    discountType: DiscountType;
    discountMode: DiscountMode;
    value: number;
    reason: string;
  }>();

  const { register: registerRefund, handleSubmit: handleRefundSubmit, reset: resetRefund } = useForm<{
    amount: number;
    reason: string;
  }>();

  const onApplyDiscount = (data: any) => {
    if (!discountModalSf) return;
    applyDiscountMutation.mutate(
      {
        studentFeeId: discountModalSf.id,
        discountType: data.discountType,
        discountMode: data.discountMode,
        value: Number(data.value),
        reason: data.reason,
      },
      {
        onSuccess: () => {
          setDiscountModalSf(null);
          resetDiscount();
        },
      }
    );
  };

  const onCreateRefund = (data: any) => {
    if (!refundModalSf) return;
    createRefundMutation.mutate(
      {
        studentFeeId: refundModalSf.id,
        amount: Number(data.amount),
        reason: data.reason,
      },
      {
        onSuccess: () => {
          setRefundModalSf(null);
          resetRefund();
        },
      }
    );
  };

  const columns = [
    {
      key: 'student',
      header: 'Student Info',
      render: (sf: any) => (
        <div>
          <p className="font-semibold text-gray-900">
            {sf.student.firstName} {sf.student.lastName}
          </p>
          <p className="text-xs text-gray-500">Roll: {sf.student.rollNumber}</p>
        </div>
      ),
    },
    {
      key: 'feePlan',
      header: 'Fee Plan',
      render: (sf: any) => (
        <div>
          <p className="text-sm font-medium text-gray-800">{sf.feeStructure.name}</p>
          <p className="text-xs text-gray-400">{sf.academicYear}</p>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Fees Breakdown',
      render: (sf: any) => (
        <div className="text-xs space-y-0.5">
          <p className="text-gray-500">Total: ₹{Number(sf.totalAmount).toLocaleString()}</p>
          {Number(sf.discountAmount) > 0 && (
            <p className="text-emerald-600 font-medium">Disc: -₹{Number(sf.discountAmount).toLocaleString()}</p>
          )}
          <p className="font-bold text-gray-900">Net: ₹{Number(sf.netAmount).toLocaleString()}</p>
        </div>
      ),
    },
    {
      key: 'collection',
      header: 'Paid vs Due',
      render: (sf: any) => {
        const balance = Number(sf.netAmount) - Number(sf.paidAmount);
        return (
          <div className="text-xs space-y-0.5">
            <p className="text-emerald-700 font-semibold">Paid: ₹{Number(sf.paidAmount).toLocaleString()}</p>
            <p className={`font-bold ${balance > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
              Due: ₹{balance.toLocaleString()}
            </p>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (sf: any) => <StatusBadge status={sf.status} />,
    },
    {
      key: 'actions',
      header: 'Financial Operations',
      className: 'w-48',
      render: (sf: any) => {
        const balance = Number(sf.netAmount) - Number(sf.paidAmount);
        return (
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => navigate(`/fees/payments/record?studentFeeId=${sf.id}`)}
              disabled={balance <= 0}
              className="btn-primary py-1 px-2 text-[10px] rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Collect
            </button>
            <button
              onClick={() => setDiscountModalSf(sf)}
              className="btn-secondary py-1 px-2 text-[10px] rounded font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              Discount
            </button>
            {Number(sf.paidAmount) > 0 && (
              <button
                onClick={() => setRefundModalSf(sf)}
                className="btn-secondary py-1 px-2 text-[10px] rounded font-semibold text-rose-700 border-rose-300 hover:bg-rose-50"
              >
                Refund
              </button>
            )}
            <button
              onClick={() => navigate(`/fees/reports?studentId=${sf.student.id}`)}
              className="btn-ghost py-1 px-2 text-[10px] rounded text-indigo-600 hover:bg-indigo-50 font-semibold"
            >
              Ledger
            </button>
          </div>
        );
      },
    },
  ];

  const batchOptions = batches?.data?.map((b: any) => ({
    value: b.id,
    label: `${b.name} (${b.code})`,
  })) || [];

  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'PARTIAL', label: 'Partially Paid' },
    { value: 'PAID', label: 'Fully Paid' },
    { value: 'OVERDUE', label: 'Overdue' },
    { value: 'WAIVED', label: 'Waived' },
  ];

  return (
    <div id="student-fees-page" className="space-y-6">
      <PageHeader
        title="Student Fee Management"
        description="Oversee fee assignments, adjust balances, and apply scholarships or refunds."
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search student name or roll number..."
          className="flex-1 max-w-md"
        />
        <FilterDropdown
          label="Batch"
          options={batchOptions}
          value={batchId}
          onChange={(v) => { setBatchId(v); setPage(1); }}
        />
        <FilterDropdown
          label="Status"
          options={statusOptions}
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
        />
      </div>

      <DataTable
        columns={columns}
        data={assignments?.data || []}
        isLoading={isLoading}
        emptyTitle="No Assigned Student Fees Found"
        emptyDescription="Search other filters or assign plans to batches first."
      />

      {assignments?.meta && (
        <Pagination
          page={assignments.meta.page}
          totalPages={assignments.meta.totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
      )}

      {/* Apply Discount Modal */}
      <Modal
        isOpen={!!discountModalSf}
        onClose={() => setDiscountModalSf(null)}
        title={`Apply Scholarship/Discount — ${discountModalSf?.student.firstName} ${discountModalSf?.student.lastName}`}
      >
        <form onSubmit={handleDiscountSubmit(onApplyDiscount)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Category *</label>
              <select {...registerDiscount('discountType', { required: true })} className="select w-full">
                <option value={DiscountType.MERIT_SCHOLARSHIP}>Merit Scholarship</option>
                <option value={DiscountType.SIBLING_DISCOUNT}>Sibling Discount</option>
                <option value={DiscountType.STAFF_DISCOUNT}>Staff Ward Discount</option>
                <option value={DiscountType.PROMOTIONAL_DISCOUNT}>Promotional Waiver</option>
                <option value={DiscountType.CUSTOM}>Other Waiver</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mode *</label>
              <select {...registerDiscount('discountMode', { required: true })} className="select w-full">
                <option value={DiscountMode.PERCENTAGE}>Percentage (%)</option>
                <option value={DiscountMode.FIXED}>Fixed Amount (₹)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Waiver Value *</label>
            <input
              type="number"
              step="any"
              {...registerDiscount('value', { required: true, min: 0 })}
              className="input w-full"
              placeholder="e.g. 15 for 15% or 5000 for ₹5000"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Approval Reason / Notes *</label>
            <textarea
              {...registerDiscount('reason', { required: true })}
              rows={3}
              className="textarea w-full text-sm"
              placeholder="Mention approval reference, scholarship exam rank, or sibling student details..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setDiscountModalSf(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={applyDiscountMutation.isPending}>
              Apply Discount
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Refund Modal */}
      <Modal
        isOpen={!!refundModalSf}
        onClose={() => setRefundModalSf(null)}
        title={`Initiate Refund Request — ${refundModalSf?.student.firstName} ${refundModalSf?.student.lastName}`}
      >
        <form onSubmit={handleRefundSubmit(onCreateRefund)} className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-lg text-xs text-amber-700 flex gap-2">
            <HelpCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Refund Validation Rule</p>
              <p className="mt-1">
                Max refundable amount is limited to the student paid amount: <strong>₹{Number(refundModalSf?.paidAmount).toLocaleString()}</strong>. All refunds require manager approval.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Refund Amount (₹) *</label>
            <input
              type="number"
              step="any"
              max={refundModalSf?.paidAmount}
              {...registerRefund('amount', { required: true, min: 0.01 })}
              className="input w-full"
              placeholder={`Max ₹${Number(refundModalSf?.paidAmount).toLocaleString()}`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Justification Reason *</label>
            <textarea
              {...registerRefund('reason', { required: true })}
              rows={3}
              className="textarea w-full text-sm"
              placeholder="Provide clear reasons for refunding (e.g. course cancellation, batch withdrawal)..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setRefundModalSf(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createRefundMutation.isPending}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
