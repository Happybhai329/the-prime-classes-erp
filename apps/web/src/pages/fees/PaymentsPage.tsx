import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { usePayments, useAdjustPayment, useGenerateReceipt } from '@/hooks/useFees';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [paymentMode, setPaymentMode] = useState<string | undefined>();
  const [adjustModalPayment, setAdjustModalPayment] = useState<any | null>(null);

  const { data: payments, isLoading } = usePayments({
    page,
    limit: 20,
    search,
    paymentMode,
  });

  const adjustMutation = useAdjustPayment();
  const generateReceiptMutation = useGenerateReceipt();

  const { register: registerAdjust, handleSubmit: handleAdjustSubmit, reset: resetAdjust } = useForm<{
    adjustedAmount: number;
    reason: string;
  }>();

  const onAdjustPayment = (data: any) => {
    if (!adjustModalPayment) return;
    adjustMutation.mutate(
      {
        paymentId: adjustModalPayment.id,
        adjustedAmount: Number(data.adjustedAmount),
        reason: data.reason,
      },
      {
        onSuccess: () => {
          setAdjustModalPayment(null);
          resetAdjust();
        },
      }
    );
  };

  const handleDownloadReceipt = (payment: any) => {
    if (payment.receipt) {
      // Receipt is already generated. Navigate to details or open receipt print page.
      navigate(`/fees/receipts?id=${payment.receipt.id}`);
    } else {
      // Generate first, then navigate
      generateReceiptMutation.mutate(payment.id, {
        onSuccess: (receipt) => {
          navigate(`/fees/receipts?id=${receipt.id}`);
        },
      });
    }
  };

  const columns = [
    {
      key: 'receiptNumber',
      header: 'Receipt #',
      render: (p: any) => <span className="font-semibold text-gray-900">{p.receiptNumber}</span>,
    },
    {
      key: 'student',
      header: 'Student',
      render: (p: any) => {
        const name = p.studentFee?.student 
          ? `${p.studentFee.student.firstName} ${p.studentFee.student.lastName}` 
          : p.invoice?.student 
            ? `${p.invoice.student.firstName} ${p.invoice.student.lastName}` 
            : 'Unknown';
        return <span className="font-medium text-gray-800">{name}</span>;
      },
    },
    {
      key: 'amountPaid',
      header: 'Amount Paid',
      render: (p: any) => (
        <span className="font-bold text-gray-900 text-sm">
          ₹{Number(p.amountPaid).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'paymentMode',
      header: 'Mode',
      render: (p: any) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded">
          {p.paymentMode}
        </span>
      ),
    },
    {
      key: 'paymentDate',
      header: 'Date',
      render: (p: any) => <span className="text-sm text-gray-600">{p.paymentDate.split('T')[0]}</span>,
    },
    {
      key: 'transactionId',
      header: 'Ref / TXN ID',
      render: (p: any) => (
        <span className="text-xs text-gray-500 font-mono">{p.transactionId || '—'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Operations',
      className: 'w-48',
      render: (p: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleDownloadReceipt(p)}
            className="btn-secondary py-1 px-2 text-[10px] rounded font-semibold text-indigo-700 border-indigo-300 hover:bg-indigo-50 flex items-center gap-1"
          >
            <FileText className="h-3.5 w-3.5" />
            Receipt
          </button>
          <button
            onClick={() => setAdjustModalPayment(p)}
            className="btn-secondary py-1 px-2 text-[10px] rounded font-semibold text-amber-700 border-amber-300 hover:bg-amber-50 flex items-center gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Adjust
          </button>
        </div>
      ),
    },
  ];

  const modeOptions = [
    { value: 'CASH', label: 'Cash' },
    { value: 'UPI', label: 'UPI / QR' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'CARD', label: 'Card Payment' },
    { value: 'CHEQUE', label: 'Cheque' },
  ];

  return (
    <div id="payments-page" className="space-y-6">
      <PageHeader
        title="Payment Transactions"
        description="View cash and digital collection history, generate receipts, and adjust payment mappings."
        actions={
          <Button onClick={() => navigate('/fees/payments/record')} className="gap-2">
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search receipt # or transaction ID..."
          className="flex-1 max-w-md"
        />
        <FilterDropdown
          label="Payment Mode"
          options={modeOptions}
          value={paymentMode}
          onChange={(v) => { setPaymentMode(v); setPage(1); }}
        />
      </div>

      <DataTable
        columns={columns}
        data={payments?.data || []}
        isLoading={isLoading}
        emptyTitle="No Payments Recorded"
        emptyDescription="Select Record Payment to register a student transaction."
      />

      {payments?.meta && (
        <Pagination
          page={payments.meta.page}
          totalPages={payments.meta.totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
      )}

      {/* Adjust Payment Modal */}
      <Modal
        isOpen={!!adjustModalPayment}
        onClose={() => setAdjustModalPayment(null)}
        title={`Adjust Recorded Payment — ${adjustModalPayment?.receiptNumber}`}
      >
        <form onSubmit={handleAdjustSubmit(onAdjustPayment)} className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-lg text-xs text-amber-700">
            <p className="font-semibold">Important Adjustment Warning</p>
            <p className="mt-1">
              Adjusting the recorded payment changes the amount allocated in the ledger. The original collected amount was <strong>₹{Number(adjustModalPayment?.amountPaid).toLocaleString()}</strong>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Adjusted Amount *</label>
            <input
              type="number"
              step="any"
              {...registerAdjust('adjustedAmount', { required: true, min: 0 })}
              className="input w-full"
              defaultValue={adjustModalPayment?.amountPaid}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Adjustment *</label>
            <textarea
              {...registerAdjust('reason', { required: true })}
              rows={3}
              className="textarea w-full text-sm"
              placeholder="e.g. Typographical error during manual data entry, incorrect cheque clearance amount..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setAdjustModalPayment(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={adjustMutation.isPending}>
              Confirm Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
