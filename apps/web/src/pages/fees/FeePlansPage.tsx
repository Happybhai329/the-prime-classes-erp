import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Calendar, BookOpen, Clock, Settings } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useFeePlans, useCreateFeePlan, useDeleteFeePlan } from '@/hooks/useFees';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FeeType, InstallmentType } from '@prime/shared-types';

interface CustomInstallmentForm {
  label: string;
  amount: number;
  dueDate: string;
}

interface FeePlanForm {
  name: string;
  course?: string;
  academicYear: string;
  feeType: FeeType;
  installmentType: InstallmentType;
  description?: string;
  registrationFee: number;
  admissionFee: number;
  monthlyFee: number;
  materialFee: number;
  examFee: number;
  totalFee: number;
  dueDay?: number;
  customInstallments: CustomInstallmentForm[];
}

export const FeePlansPage: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: plans, isLoading } = useFeePlans();
  const createMutation = useCreateFeePlan();
  const deleteMutation = useDeleteFeePlan();

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FeePlanForm>({
    defaultValues: {
      name: '',
      course: '',
      academicYear: '2026-27',
      feeType: FeeType.MONTHLY,
      installmentType: InstallmentType.ONE_TIME,
      description: '',
      registrationFee: 0,
      admissionFee: 0,
      monthlyFee: 0,
      materialFee: 0,
      examFee: 0,
      totalFee: 0,
      dueDay: 5,
      customInstallments: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'customInstallments',
  });

  const selectedInstallmentType = watch('installmentType');

  // Watch breakdown values to calculate total fee dynamically
  const regFee = watch('registrationFee') || 0;
  const admFee = watch('admissionFee') || 0;
  const monFee = watch('monthlyFee') || 0;
  const matFee = watch('materialFee') || 0;
  const exmFee = watch('examFee') || 0;
  const totalFee = watch('totalFee') || 0;

  React.useEffect(() => {
    // Standard total is the sum of breakdown components
    // If monthly, it typically includes 10 months or similar, but let's just do a clean summation of defined fields as baseline
    const calculatedTotal = Number(regFee) + Number(admFee) + Number(monFee) + Number(matFee) + Number(exmFee);
    setValue('totalFee', calculatedTotal);
  }, [regFee, admFee, monFee, matFee, exmFee, setValue]);

  const onSubmit = (data: FeePlanForm) => {
    // Parse numeric fields
    const formattedData = {
      ...data,
      registrationFee: Number(data.registrationFee),
      admissionFee: Number(data.admissionFee),
      monthlyFee: Number(data.monthlyFee),
      materialFee: Number(data.materialFee),
      examFee: Number(data.examFee),
      totalFee: Number(data.totalFee),
      dueDay: data.dueDay ? Number(data.dueDay) : undefined,
      customInstallments: data.installmentType === InstallmentType.CUSTOM 
        ? data.customInstallments.map((inst) => ({
            ...inst,
            amount: Number(inst.amount),
          }))
        : undefined,
    };

    createMutation.mutate(formattedData, {
      onSuccess: () => {
        setIsModalOpen(false);
        reset();
      },
    });
  };

  const columns = [
    {
      key: 'name',
      header: 'Plan Name',
      render: (p: any) => (
        <div>
          <p className="font-semibold text-gray-900">{p.name}</p>
          <p className="text-xs text-gray-500">{p.description || 'No description'}</p>
        </div>
      ),
    },
    {
      key: 'academicYear',
      header: 'Academic Year',
      render: (p: any) => (
        <span className="inline-flex items-center gap-1 text-sm text-gray-700">
          <Calendar className="h-4 w-4 text-gray-400" />
          {p.academicYear}
        </span>
      ),
    },
    {
      key: 'course',
      header: 'Course/Batch',
      render: (p: any) => (
        <span className="inline-flex items-center gap-1 text-sm text-gray-700">
          <BookOpen className="h-4 w-4 text-gray-400" />
          {p.course || 'All Courses'}
        </span>
      ),
    },
    {
      key: 'installmentType',
      header: 'Schedule',
      render: (p: any) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
          <Clock className="h-3 w-3" />
          {p.installmentType}
        </span>
      ),
    },
    {
      key: 'totalFee',
      header: 'Total Fee',
      render: (p: any) => (
        <span className="font-bold text-gray-900 text-sm">
          ₹{Number(p.totalFee).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-20',
      render: (p: any) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/fees/plans/${p.id}`);
            }}
            className="btn-ghost btn-sm text-xs text-indigo-600 hover:text-indigo-700"
          >
            Details
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(p.id);
            }}
            className="btn-ghost btn-sm text-xs text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div id="fee-plans-page" className="space-y-6">
      <PageHeader
        title="Fee Plans"
        description="Configure structured payment programs for batches and academic sessions."
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Fee Plan
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={plans?.data || []}
        isLoading={isLoading}
        emptyTitle="No Fee Plans Defined"
        emptyDescription="Create academic structures and payment cycles."
      />

      {/* Modal for creating a fee plan */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        title="Create Fee Plan"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Fee Plan Name *</label>
              <input
                type="text"
                {...register('name', { required: 'Plan Name is required' })}
                className="input w-full"
                placeholder="e.g. Sainik Foundation Batch"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Course / Category</label>
              <input
                type="text"
                {...register('course')}
                className="input w-full"
                placeholder="e.g. Class VI Entry"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Academic Year *</label>
              <input
                type="text"
                {...register('academicYear', { required: 'Academic Year is required' })}
                className="input w-full"
                placeholder="e.g. 2026-27"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Fee Type</label>
              <select {...register('feeType')} className="select w-full">
                <option value="ANNUAL">Annual Course Fee</option>
                <option value="MONTHLY">Monthly Tuition</option>
                <option value="ADMISSION">Admission Setup</option>
                <option value="MATERIAL">Books & Material</option>
                <option value="EXAM">Test & Examination</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1">
              <Settings className="h-4 w-4 text-indigo-500" />
              Fee Breakdown Config
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Registration</label>
                <input type="number" {...register('registrationFee')} className="input w-full text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Admission</label>
                <input type="number" {...register('admissionFee')} className="input w-full text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Monthly Tuition</label>
                <input type="number" {...register('monthlyFee')} className="input w-full text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Materials</label>
                <input type="number" {...register('materialFee')} className="input w-full text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Exams</label>
                <input type="number" {...register('examFee')} className="input w-full text-sm" />
              </div>
            </div>

            <div className="mt-3 bg-gray-50 p-3 rounded-lg flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Auto-calculated Total:</span>
              <span className="text-lg font-bold text-indigo-700">₹{totalFee.toLocaleString()}</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1">
              <Clock className="h-4 w-4 text-indigo-500" />
              Installment Schedule Config
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Installment Split Type</label>
                <select {...register('installmentType')} className="select w-full">
                  <option value="ONE_TIME">One Time payment</option>
                  <option value="MONTHLY">Monthly installments</option>
                  <option value="QUARTERLY">Quarterly splits</option>
                  <option value="CUSTOM">Custom schedule</option>
                </select>
              </div>

              {selectedInstallmentType !== InstallmentType.CUSTOM && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Standard Due Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    {...register('dueDay')}
                    className="input w-full"
                    placeholder="e.g. 5"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Day of the month when installment becomes overdue.</p>
                </div>
              )}
            </div>

            {selectedInstallmentType === InstallmentType.CUSTOM && (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-gray-600">Custom Installment Schedules</span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => append({ label: `Installment ${fields.length + 1}`, amount: 0, dueDate: '' })}
                  >
                    Add Row
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Label (e.g. First Half)"
                      {...register(`customInstallments.${index}.label` as const, { required: true })}
                      className="input flex-1 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      {...register(`customInstallments.${index}.amount` as const, { required: true })}
                      className="input w-32 text-sm"
                    />
                    <input
                      type="date"
                      {...register(`customInstallments.${index}.dueDate` as const, { required: true })}
                      className="input w-44 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {fields.length === 0 && (
                  <p className="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg text-center border border-dashed">
                    No custom installments added yet. Click Add Row.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Notes</label>
            <textarea
              {...register('description')}
              rows={2}
              className="textarea w-full text-sm"
              placeholder="Provide plan terms, eligibility details, or notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Submit & Activate
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
          }
        }}
        title="Delete Fee Plan"
        message="Are you sure you want to delete this fee plan? Students already assigned this plan will not be impacted, but new assignments cannot be made."
        confirmLabel="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
