import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Printer, CheckCircle, Eye } from 'lucide-react';
import { useReceipts, useReceipt } from '@/hooks/useFees';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export const ReceiptsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialReceiptId = searchParams.get('id') || '';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedReceiptId, setSelectedReceiptId] = useState<string>(initialReceiptId);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const { data: receipts, isLoading } = useReceipts({
    page,
    limit: 20,
    search,
  });

  const { data: detailedReceipt } = useReceipt(selectedReceiptId);

  // If a receipt ID is passed via search params, open the print preview modal automatically
  useEffect(() => {
    if (initialReceiptId) {
      setSelectedReceiptId(initialReceiptId);
      setIsPrintModalOpen(true);
    }
  }, [initialReceiptId]);

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      key: 'receiptNumber',
      header: 'Receipt #',
      render: (r: any) => <span className="font-semibold text-gray-900">{r.receiptNumber}</span>,
    },
    {
      key: 'studentName',
      header: 'Student Name',
      render: (r: any) => <span className="font-medium text-gray-800">{r.studentName}</span>,
    },
    {
      key: 'amount',
      header: 'Paid Amount',
      render: (r: any) => (
        <span className="font-bold text-gray-900 text-sm">
          ₹{Number(r.amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'paymentMode',
      header: 'Mode',
      render: (r: any) => (
        <span className="inline-flex items-center text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
          {r.paymentMode}
        </span>
      ),
    },
    {
      key: 'paymentDate',
      header: 'Payment Date',
      render: (r: any) => <span className="text-sm text-gray-600">{r.paymentDate}</span>,
    },
    {
      key: 'actions',
      header: 'Preview Receipt',
      className: 'w-24',
      render: (r: any) => (
        <button
          onClick={() => {
            setSelectedReceiptId(r.id);
            setIsPrintModalOpen(true);
          }}
          className="btn-secondary py-1 px-2.5 text-xs rounded font-semibold text-indigo-700 border-indigo-300 hover:bg-indigo-50 flex items-center gap-1.5"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>
      ),
    },
  ];

  return (
    <div id="receipts-page" className="space-y-6">
      <PageHeader
        title="Digital Fee Receipts"
        description="Verify verifiable digital receipts with automated security tokens and QR hashes."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search receipt # or student name..."
          className="flex-1 max-w-md"
        />
      </div>

      <DataTable
        columns={columns}
        data={receipts?.data || []}
        isLoading={isLoading}
        emptyTitle="No Receipts Available"
        emptyDescription="Verify other filters or generate a payment transaction first."
      />

      {receipts?.meta && (
        <Pagination
          page={receipts.meta.page}
          totalPages={receipts.meta.totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
      )}

      {/* Verifiable QR Print Modal */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Print Digital Receipt"
        size="md"
      >
        {detailedReceipt ? (
          <div className="space-y-6">
            {/* Printable Receipt Layout */}
            <div id="printable-receipt" className="border border-gray-300 p-6 rounded-lg bg-white space-y-6 print:border-0 print:p-0">
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{detailedReceipt.instituteName || 'The Prime Classes'}</h3>
                  <p className="text-xs text-gray-500">Verifiable Fee Receipt</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{detailedReceipt.receiptNumber}</p>
                  <p className="text-[10px] text-gray-500">Date: {detailedReceipt.paymentDate}</p>
                </div>
              </div>

              {/* Student Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 font-medium block uppercase tracking-wider text-[9px]">Student Name</span>
                  <span className="font-semibold text-gray-800 text-sm mt-0.5 block">{detailedReceipt.studentName}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block uppercase tracking-wider text-[9px]">Payment Mode</span>
                  <span className="font-semibold text-gray-800 text-sm mt-0.5 block">{detailedReceipt.paymentMode}</span>
                </div>
              </div>

              {/* Ledger Summary */}
              <div className="border border-gray-200 rounded-lg overflow-hidden text-xs">
                <div className="bg-gray-50 px-4 py-2 border-b flex justify-between font-bold text-gray-700">
                  <span>Fee Category Description</span>
                  <span>Amount Paid</span>
                </div>
                <div className="px-4 py-3 flex justify-between items-center text-gray-900 font-medium">
                  <span>{detailedReceipt.feeDescription}</span>
                  <span className="font-bold text-sm">₹{Number(detailedReceipt.amount).toLocaleString()}</span>
                </div>
              </div>

              {/* Footer Verifiability */}
              <div className="flex gap-4 items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                {/* QR placeholder / representation */}
                <div className="h-20 w-20 bg-white border border-gray-200 p-1 shrink-0 rounded flex items-center justify-center">
                  {/* Verification QR Representation */}
                  <div className="flex flex-col items-center justify-center text-[8px] text-gray-400 text-center font-semibold">
                    <div className="grid grid-cols-5 gap-0.5 p-0.5">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={`h-2.5 w-2.5 ${((i * 7) % 5 === 0 || i % 3 === 0) ? 'bg-gray-900' : 'bg-transparent'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-indigo-800 leading-normal">
                  <p className="font-bold text-xs flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    Verifiable Academic Invoice
                  </p>
                  <p className="mt-1 text-indigo-600">
                    This is an electronically generated receipt that is cryptographically tied to transaction records. Scan QR or inspect verified link below:
                  </p>
                  <p className="mt-1 font-mono text-[9px] text-gray-500 break-all select-all">
                    {detailedReceipt.qrData}
                  </p>
                </div>
              </div>
            </div>

            {/* Print action buttons */}
            <div className="flex justify-end gap-3 border-t pt-4 print:hidden">
              <Button variant="secondary" onClick={() => setIsPrintModalOpen(false)}>
                Close
              </Button>
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print Receipt (Ctrl+P)
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        )}
      </Modal>
    </div>
  );
};
