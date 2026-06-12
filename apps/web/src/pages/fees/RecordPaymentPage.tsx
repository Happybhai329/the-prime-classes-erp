import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, CreditCard, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useStudents } from '@/hooks/useStudents';
import { useStudentFees, useStudentFee, useRecordPayment } from '@/hooks/useFees';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PaymentMode } from '@prime/shared-types';

interface RecordPaymentForm {
  studentFeeId: string;
  installmentId?: string;
  amountPaid: number;
  paymentMode: PaymentMode;
  paymentDate?: string;
  transactionId?: string;
  notes?: string;
  isAdvance?: boolean;
}

export const RecordPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStudentFeeId = searchParams.get('studentFeeId') || '';

  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentFeeId, setSelectedStudentFeeId] = useState<string>(initialStudentFeeId);

  // Queries
  const { data: studentsData } = useStudents({ search: studentSearch, limit: 10 });
  const { data: studentFeesData } = useStudentFees({ 
    studentId: selectedStudentId || undefined,
    academicYear: '2026-27' 
  });
  const { data: detailedFee } = useStudentFee(selectedStudentFeeId);
  const recordMutation = useRecordPayment();

  const { register, handleSubmit, setValue, watch, reset } = useForm<RecordPaymentForm>({
    defaultValues: {
      studentFeeId: initialStudentFeeId,
      amountPaid: 0,
      paymentMode: PaymentMode.CASH,
      paymentDate: new Date().toISOString().split('T')[0],
      transactionId: '',
      notes: '',
      isAdvance: false,
    },
  });

  const selectedInstallmentId = watch('installmentId');

  // If initialStudentFeeId is loaded, set student details accordingly
  useEffect(() => {
    if (detailedFee && !selectedStudentId) {
      setSelectedStudentId(detailedFee.student.id);
    }
  }, [detailedFee, selectedStudentId]);

  // Set student fee ID when assignment dropdown/value changes
  useEffect(() => {
    if (selectedStudentFeeId) {
      setValue('studentFeeId', selectedStudentFeeId);
    }
  }, [selectedStudentFeeId, setValue]);

  // Set payment amount when an installment is selected
  useEffect(() => {
    if (selectedInstallmentId && detailedFee?.installments) {
      const selectedInst = detailedFee.installments.find((inst: any) => inst.id === selectedInstallmentId);
      if (selectedInst) {
        const remainingAmount = Number(selectedInst.amount) - Number(selectedInst.paidAmount);
        setValue('amountPaid', remainingAmount);
      }
    } else if (detailedFee) {
      // Calculate full remaining amount
      const remainingBalance = Number(detailedFee.netAmount) - Number(detailedFee.paidAmount);
      setValue('amountPaid', Math.max(0, remainingBalance));
    }
  }, [selectedInstallmentId, detailedFee, setValue]);

  const onSubmit = (data: RecordPaymentForm) => {
    const formattedData = {
      ...data,
      amountPaid: Number(data.amountPaid),
      installmentId: data.installmentId || undefined,
      paymentDate: data.paymentDate ? new Date(data.paymentDate).toISOString() : undefined,
      transactionId: data.transactionId || undefined,
      notes: data.notes || undefined,
    };

    recordMutation.mutate(formattedData, {
      onSuccess: () => {
        navigate('/fees/payments');
      },
    });
  };

  const handleStudentSelect = (student: any) => {
    setSelectedStudentId(student.id);
    setStudentSearch(`${student.firstName} ${student.lastName}`);
    setSelectedStudentFeeId('');
    reset({
      studentFeeId: '',
      amountPaid: 0,
      paymentMode: PaymentMode.CASH,
      paymentDate: new Date().toISOString().split('T')[0],
      transactionId: '',
      notes: '',
      isAdvance: false,
    });
  };

  // Automatically select the first fee structure if only one is returned
  useEffect(() => {
    if (studentFeesData?.data && studentFeesData.data.length > 0 && !selectedStudentFeeId) {
      setSelectedStudentFeeId(studentFeesData.data[0].id);
    }
  }, [studentFeesData, selectedStudentFeeId]);

  const pendingInstallments = detailedFee?.installments?.filter((inst: any) => inst.status !== 'PAID') || [];
  const totalRemaining = detailedFee ? Number(detailedFee.netAmount) - Number(detailedFee.paidAmount) : 0;

  return (
    <div id="record-payment-page" className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/fees/payments')} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Record Fee Payment</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Student & Plan details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Find Student */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Search className="h-5 w-5 text-indigo-500" />
              1. Select Student
            </h3>
            
            <div className="relative">
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  if (selectedStudentId) {
                    setSelectedStudentId(null);
                    setSelectedStudentFeeId('');
                  }
                }}
                className="input w-full pl-10"
                placeholder="Type student name or roll number to search..."
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />

              {studentSearch && !selectedStudentId && studentsData?.data && studentsData.data.length > 0 && (
                <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y">
                  {studentsData.data.map((s: any) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleStudentSelect(s)}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{s.firstName} {s.lastName}</p>
                        <p className="text-xs text-gray-500">Roll: {s.rollNumber} | Class: {s.classStudying}</p>
                      </div>
                      <span className="text-xs text-indigo-600 font-semibold">Select</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedStudentId && studentFeesData?.data && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Fee Plan Structure</label>
                <select
                  value={selectedStudentFeeId}
                  onChange={(e) => setSelectedStudentFeeId(e.target.value)}
                  className="select w-full"
                >
                  <option value="">Select structure...</option>
                  {studentFeesData.data.map((sf: any) => (
                    <option key={sf.id} value={sf.id}>
                      {sf.feeStructure.name} (₹{Number(sf.netAmount).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Step 2: Installment Details & Summary */}
          {detailedFee && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{detailedFee.feeStructure.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Academic Year: {detailedFee.academicYear} | Student: {detailedFee.student.firstName} {detailedFee.student.lastName}
                  </p>
                </div>
                <StatusBadge status={detailedFee.status} />
              </div>

              <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl text-center">
                <div>
                  <p className="text-xs text-gray-500">Net Fee</p>
                  <p className="text-lg font-bold text-gray-900">₹{Number(detailedFee.netAmount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Paid So Far</p>
                  <p className="text-lg font-bold text-emerald-700">₹{Number(detailedFee.paidAmount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Remaining Balance</p>
                  <p className="text-lg font-bold text-amber-600">₹{totalRemaining.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 text-sm mb-3">Installment Schedule Overview</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">No.</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Label</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Due Date</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Amount</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Paid</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {detailedFee.installments.map((inst: any) => (
                        <tr key={inst.id}>
                          <td className="px-4 py-2">{inst.installmentNo}</td>
                          <td className="px-4 py-2 font-medium">{inst.label}</td>
                          <td className="px-4 py-2">{inst.dueDate.split('T')[0]}</td>
                          <td className="px-4 py-2">₹{Number(inst.amount).toLocaleString()}</td>
                          <td className="px-4 py-2">₹{Number(inst.paidAmount).toLocaleString()}</td>
                          <td className="px-4 py-2">
                            <StatusBadge status={inst.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Form Submission */}
        <div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 sticky top-6">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
              <CreditCard className="h-5 w-5 text-indigo-500" />
              2. Transaction Details
            </h3>

            {detailedFee ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {pendingInstallments.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Pay Specific Installment</label>
                    <select {...register('installmentId')} className="select w-full">
                      <option value="">Full Outstanding Balance (₹{totalRemaining.toLocaleString()})</option>
                      {pendingInstallments.map((inst: any) => {
                        const due = Number(inst.amount) - Number(inst.paidAmount);
                        return (
                          <option key={inst.id} value={inst.id}>
                            {inst.label} (Due: ₹{due.toLocaleString()})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Amount (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    {...register('amountPaid', { required: true, min: 0.01 })}
                    className="input w-full font-bold text-gray-900"
                    placeholder="Enter amount..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Mode *</label>
                  <select {...register('paymentMode', { required: true })} className="select w-full">
                    <option value={PaymentMode.CASH}>Cash Payment</option>
                    <option value={PaymentMode.UPI}>UPI / Scan QR</option>
                    <option value={PaymentMode.BANK_TRANSFER}>Bank Wire / Net Banking</option>
                    <option value={PaymentMode.CARD}>Credit / Debit Card</option>
                    <option value={PaymentMode.CHEQUE}>Cheque Deposit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Transaction/Reference ID</label>
                  <input
                    type="text"
                    {...register('transactionId')}
                    className="input w-full text-sm"
                    placeholder="e.g. UTR Number, Cheque #"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    {...register('paymentDate', { required: true })}
                    className="input w-full text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Internal Reference Notes</label>
                  <textarea
                    {...register('notes')}
                    rows={2}
                    className="textarea w-full text-xs"
                    placeholder="Reference parent conversation, partial payment agreements..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isAdvance" {...register('isAdvance')} className="rounded border-gray-300" />
                  <label htmlFor="isAdvance" className="text-xs text-gray-600 font-semibold select-none cursor-pointer">
                    Flag as Advance Payment
                  </label>
                </div>

                <div className="bg-indigo-50 p-3 rounded-lg text-[10px] text-indigo-700 flex gap-2">
                  <Info className="h-4 w-4 shrink-0" />
                  <p>
                    Saving this will immediately generate a digital receipt with QR verification, credit the student ledger, and auto-update enrollment statuses.
                  </p>
                </div>

                <Button type="submit" className="w-full justify-center mt-2" isLoading={recordMutation.isPending}>
                  Record & Generate Receipt
                </Button>
              </form>
            ) : (
              <p className="text-xs text-gray-500 text-center py-6">
                Please search and select a student on the left to activate transaction form.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
