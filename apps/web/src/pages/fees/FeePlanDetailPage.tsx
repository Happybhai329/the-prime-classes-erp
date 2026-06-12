import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Layers } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useFeePlan, useStudentFees, useBulkAssignFeePlan } from '@/hooks/useFees';
import { useBatches } from '@/hooks/useBatches';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TabGroup } from '@/components/ui/TabGroup';

export const FeePlanDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const { data: plan, isLoading: planLoading } = useFeePlan(id);
  const { data: assignments, isLoading: assignmentsLoading } = useStudentFees({ feeStructureId: id });
  const { data: batches } = useBatches({ limit: 100 });
  const bulkAssignMutation = useBulkAssignFeePlan();

  const { register, handleSubmit, reset } = useForm<{ batchId: string; academicYear: string }>();

  if (planLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-6 text-center bg-white rounded-lg border">
        <h3 className="text-lg font-bold text-gray-950">Plan not found</h3>
        <Button onClick={() => navigate('/fees/plans')} className="mt-4">
          Back to Plans
        </Button>
      </div>
    );
  }

  const handleBulkAssignSubmit = (data: { batchId: string; academicYear: string }) => {
    bulkAssignMutation.mutate(
      {
        feeStructureId: id,
        batchId: data.batchId,
        academicYear: data.academicYear,
      },
      {
        onSuccess: () => {
          setIsAssignModalOpen(false);
          reset();
        },
      }
    );
  };

  const assignmentColumns = [
    {
      key: 'student',
      header: 'Student Name',
      render: (sf: any) => (
        <div>
          <p className="font-semibold text-gray-900">
            {sf.student.firstName} {sf.student.lastName}
          </p>
          <p className="text-xs text-gray-500">{sf.student.rollNumber}</p>
        </div>
      ),
    },
    {
      key: 'academicYear',
      header: 'Academic Year',
      render: (sf: any) => <span className="text-sm text-gray-700">{sf.academicYear}</span>,
    },
    {
      key: 'totalAmount',
      header: 'Net Total',
      render: (sf: any) => (
        <span className="font-semibold text-gray-900 text-sm">
          ₹{Number(sf.netAmount).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'paidAmount',
      header: 'Paid',
      render: (sf: any) => (
        <span className="text-emerald-700 text-sm font-semibold">
          ₹{Number(sf.paidAmount).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'dueAmount',
      header: 'Balance Due',
      render: (sf: any) => {
        const balance = Number(sf.netAmount) - Number(sf.paidAmount);
        return (
          <span className={`text-sm font-bold ${balance > 0 ? 'text-amber-600' : 'text-gray-500'}`}>
            ₹{balance.toLocaleString()}
          </span>
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
      header: '',
      className: 'w-20',
      render: () => (
        <button
          onClick={() => navigate(`/fees/student-fees`)}
          className="btn-ghost btn-sm text-xs text-indigo-600"
        >
          View Ledger
        </button>
      ),
    },
  ];

  return (
    <div id="fee-plan-detail-page" className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/fees/plans')} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Plan Details: {plan.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Summary & Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">General Information</h3>
            <div className="mt-3 space-y-3">
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-gray-500">Academic Year</span>
                <span className="font-semibold text-gray-900">{plan.academicYear}</span>
              </div>
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-gray-500">Course / Stream</span>
                <span className="font-semibold text-gray-900">{plan.course || 'All Courses'}</span>
              </div>
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-gray-500">Billing Schedule</span>
                <span className="font-semibold text-gray-900 uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                  {plan.installmentType}
                </span>
              </div>
              {plan.dueDay && (
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-gray-500">Standard Due Day</span>
                  <span className="font-semibold text-gray-900">Day {plan.dueDay} of month</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900">Fee Structure Breakdown</h3>
            <div className="mt-3 space-y-3">
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-gray-500">Registration Fee</span>
                <span className="font-medium text-gray-900">₹{Number(plan.registrationFee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-gray-500">Admission Fee</span>
                <span className="font-medium text-gray-900">₹{Number(plan.admissionFee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-gray-500">Monthly Tuition Fee</span>
                <span className="font-medium text-gray-900">₹{Number(plan.monthlyFee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-gray-500">Material Fee</span>
                <span className="font-medium text-gray-900">₹{Number(plan.materialFee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-gray-500">Exam Fee</span>
                <span className="font-medium text-gray-900">₹{Number(plan.examFee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1 bg-gray-50 p-2 rounded">
                <span className="text-indigo-900">Total Program Fee</span>
                <span className="text-indigo-700">₹{Number(plan.totalFee).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {plan.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Description</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
                {plan.description}
              </p>
            </div>
          )}
        </div>

        {/* Right Section: Tabbed Content (Assignments & Installment templates) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <TabGroup
              tabs={[
                { id: 'students', label: 'Assigned Students' },
                { id: 'templates', label: 'Billing Intervals' },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            {activeTab === 'students' && (
              <Button onClick={() => setIsAssignModalOpen(true)} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Assign to Batch
              </Button>
            )}
          </div>

          {activeTab === 'students' ? (
            <DataTable
              columns={assignmentColumns}
              data={assignments?.data || []}
              isLoading={assignmentsLoading}
              emptyTitle="No Assigned Students"
              emptyDescription="Assign this structure plan to a batch or individual student."
            />
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Generated Billing Schedule Intervals</h3>
              {plan.installmentType === 'ONE_TIME' ? (
                <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                  This plan is one-time payment. The full program fee of ₹{Number(plan.totalFee).toLocaleString()} is charged upfront.
                </p>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-bold text-gray-700">Interval Label</th>
                        <th className="px-4 py-2 text-left font-bold text-gray-700">Approx. Percent</th>
                        <th className="px-4 py-2 text-left font-bold text-gray-700">Recalculation Rule</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {plan.installmentType === 'MONTHLY' && (
                        <tr>
                          <td className="px-4 py-2 font-medium">Monthly billing (10 periods)</td>
                          <td className="px-4 py-2">10% / period</td>
                          <td className="px-4 py-2 text-gray-500">Tuition is divided equally or set by configuration.</td>
                        </tr>
                      )}
                      {plan.installmentType === 'QUARTERLY' && (
                        <tr>
                          <td className="px-4 py-2 font-medium">Quarterly billing (4 periods)</td>
                          <td className="px-4 py-2">25% / period</td>
                          <td className="px-4 py-2 text-gray-500">Divided into Q1, Q2, Q3, and Q4 equal splits.</td>
                        </tr>
                      )}
                      {plan.installmentType === 'CUSTOM' && (
                        <tr>
                          <td className="px-4 py-2 font-medium">Custom Billing</td>
                          <td className="px-4 py-2">Dynamic</td>
                          <td className="px-4 py-2 text-gray-500">Calculated according to custom dates entered on plan creation.</td>
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

      {/* Bulk Assignment Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Fee Plan to Batch"
      >
        <form onSubmit={handleSubmit(handleBulkAssignSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Target Batch *</label>
            <select {...register('batchId', { required: 'Target batch is required' })} className="select w-full">
              <option value="">Select a batch...</option>
              {batches?.data?.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Academic Year *</label>
            <input
              type="text"
              {...register('academicYear', { required: 'Academic Year is required' })}
              className="input w-full"
              defaultValue={plan.academicYear}
            />
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg flex gap-3 text-indigo-700 text-xs">
            <Layers className="h-5 w-5 text-indigo-500 shrink-0" />
            <div>
              <p className="font-semibold">Important Notes</p>
              <p className="mt-1">
                Assigning this fee plan will auto-generate invoices and billing installments for all students currently enrolled in the selected batch.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={bulkAssignMutation.isPending}>
              Confirm & Assign
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
