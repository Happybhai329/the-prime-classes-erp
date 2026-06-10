import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCreateTest } from '@/hooks/useTests';
import { useBatches } from '@/hooks/useBatches';
import { PageHeader } from '@/components/ui/PageHeader';
import { TestType } from '@prime/shared-types';

export const CreateTestPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateTest();
  const { data: batchesData } = useBatches({ limit: 100 });
  const batches = batchesData?.data || [];

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      testType: TestType.MOCK,
      batchId: '',
      subjectIds: [] as string[],
      totalMarks: 100,
      durationMinutes: 120,
      testDate: new Date().toISOString().split('T')[0],
    }
  });

  const onSubmit = (data: any) => {
    // If no specific subjects selected, we still need to send an array, backend handles empty array
    const payload = {
      ...data,
      totalMarks: Number(data.totalMarks),
      durationMinutes: Number(data.durationMinutes),
    };
    
    createMutation.mutate(payload, {
      onSuccess: () => navigate('/tests'),
    });
  };

  return (
    <div id="create-test-page" className="max-w-3xl">
      <PageHeader title="Create New Test" description="Schedule a new test or exam for a batch" />

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="label">Test Name *</label>
            <input {...register('name', { required: 'Name is required' })} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="e.g. Sainik Mock Test 1" />
            {errors.name && <p className="text-danger-500 text-xs mt-1">{errors.name.message as string}</p>}
          </div>

          <div>
            <label className="label">Test Type *</label>
            <select {...register('testType')} className="input">
              {Object.values(TestType).map(t => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Batch *</label>
            <select {...register('batchId', { required: 'Batch is required' })} className={`input ${errors.batchId ? 'input-error' : ''}`}>
              <option value="">-- Select Batch --</option>
              {batches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {errors.batchId && <p className="text-danger-500 text-xs mt-1">{errors.batchId.message as string}</p>}
          </div>

          <div>
            <label className="label">Total Marks *</label>
            <input type="number" {...register('totalMarks', { required: true, min: 1 })} className="input" />
          </div>

          <div>
            <label className="label">Duration (Minutes)</label>
            <input type="number" {...register('durationMinutes')} className="input" />
          </div>

          <div>
            <label className="label">Test Date *</label>
            <input type="date" {...register('testDate', { required: true })} className="input" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <button type="button" onClick={() => navigate('/tests')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={createMutation.isPending} className="btn-primary">
            {createMutation.isPending ? 'Creating...' : 'Create Test'}
          </button>
        </div>
      </form>
    </div>
  );
};
