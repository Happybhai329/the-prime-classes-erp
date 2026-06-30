import React, { useState, useEffect } from 'react';
import { useBatches } from '@/hooks/useBatches';
import { useFeePlans } from '@/hooks/useFees';
import { useEnrollIntoAcademic } from '@/hooks/useSales';
import { Loader2, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';

interface EnrollmentWizardModalProps {
  admissionId: string;
  studentName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const EnrollmentWizardModal: React.FC<EnrollmentWizardModalProps> = ({
  admissionId,
  studentName,
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState(1);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [section, setSection] = useState('Section A');
  const [rollNumber, setRollNumber] = useState('');
  const [selectedFeeStructure, setSelectedFeeStructure] = useState('');

  // Fetch batches & fee structures
  const { data: batchesData, isLoading: loadingBatches } = useBatches({ limit: 100 });
  const { data: feePlansData, isLoading: loadingFeePlans } = useFeePlans();
  const enrollMutation = useEnrollIntoAcademic();

  const batches = batchesData?.data || [];
  const feePlans = feePlansData || [];

  // Suggest a default roll number when batch is selected
  useEffect(() => {
    if (selectedBatch && !rollNumber) {
      const year = new Date().getFullYear();
      const randomId = Math.floor(100 + Math.random() * 900);
      setRollNumber(`PRM-${year}-${randomId}`);
    }
  }, [selectedBatch]);

  if (!isOpen) return null;

  const handleNext = () => setStep((s) => Math.min(s + 1, 5));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleFinish = () => {
    enrollMutation.mutate(
      {
        id: admissionId,
        data: {
          batchId: selectedBatch,
          section,
          rollNumber,
          feeStructureId: selectedFeeStructure || undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const steps = [
    { number: 1, label: 'Batch' },
    { number: 2, label: 'Section' },
    { number: 3, label: 'Roll Number' },
    { number: 4, label: 'Fees' },
    { number: 5, label: 'Finish' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-primary-700 p-6 text-white">
          <h2 className="text-xl font-display font-semibold">Academic Enrollment Wizard</h2>
          <p className="text-xs text-primary-200 mt-1">Enrolling Student: {studentName}</p>
        </div>

        {/* Stepper Progress */}
        <div className="flex justify-around items-center border-b border-gray-100 py-4 px-6 bg-gray-50">
          {steps.map((s) => (
            <div key={s.number} className="flex items-center gap-1.5">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step >= s.number
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s.number}
              </span>
              <span
                className={`text-xs font-medium ${
                  step === s.number ? 'text-primary-800 font-bold' : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
              {s.number < 5 && <ChevronRight className="h-3 w-3 text-gray-300" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 min-h-[220px]">
          {/* Step 1: Choose Batch */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">Select Batch *</label>
              {loadingBatches ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="animate-spin text-primary-600 h-6 w-6" />
                </div>
              ) : (
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">-- Choose Batch --</option>
                  {batches.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code}) - {b.academicYear}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500">Choose the batch the student should be enrolled into.</p>
            </div>
          )}

          {/* Step 2: Choose Section */}
          {step === 2 && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">Assign Section *</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-primary-500"
              >
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
                <option value="Section C">Section C</option>
                <option value="Section D">Section D</option>
              </select>
              <p className="text-xs text-gray-500">Class sections for student scheduling and attendance.</p>
            </div>
          )}

          {/* Step 3: Assign Roll Number */}
          {step === 3 && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">Assign Roll Number *</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Suggesting unique roll number..."
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500">Unique identifier for student academic tracking.</p>
            </div>
          )}

          {/* Step 4: Fee Structure */}
          {step === 4 && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">Select Fee Plan (Optional)</label>
              {loadingFeePlans ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="animate-spin text-primary-600 h-6 w-6" />
                </div>
              ) : (
                <select
                  value={selectedFeeStructure}
                  onChange={(e) => setSelectedFeeStructure(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">-- No Fee Plan / Assign Later --</option>
                  {feePlans.map((fp: any) => (
                    <option key={fp.id} value={fp.id}>
                      {fp.name} (Total: ₹{fp.totalFee}) - {fp.academicYear}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500">Assign a fee plan template to initialize the student's ledger.</p>
            </div>
          )}

          {/* Step 5: Finish */}
          {step === 5 && (
            <div className="space-y-4 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 animate-bounce" />
              <h3 className="text-base font-semibold text-gray-900">Ready to Enroll Student</h3>
              <div className="text-left bg-gray-50 p-4 rounded-lg text-xs space-y-1.5 text-gray-600 border border-gray-200">
                <p><strong>Student Name:</strong> {studentName}</p>
                <p><strong>Batch:</strong> {batches.find((b: any) => b.id === selectedBatch)?.name || 'N/A'}</p>
                <p><strong>Section:</strong> {section}</p>
                <p><strong>Roll Number:</strong> {rollNumber}</p>
                <p><strong>Fee Plan:</strong> {feePlans.find((fp: any) => fp.id === selectedFeeStructure)?.name || 'None'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>

          <div className="flex gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="btn btn-secondary flex items-center gap-1 text-sm py-1.5 px-3"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={step === 1 && !selectedBatch}
                className="btn btn-primary flex items-center gap-1 text-sm py-1.5 px-3 disabled:opacity-50"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={enrollMutation.isPending}
                className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 border-none flex items-center gap-1.5 text-sm py-1.5 px-4"
              >
                {enrollMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" /> Enrolling...
                  </>
                ) : (
                  'Finish & Enroll'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
