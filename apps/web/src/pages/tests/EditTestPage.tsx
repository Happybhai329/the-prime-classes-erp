import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTest, useUpdateTest } from '@/hooks/useTests';
import { useBatches } from '@/hooks/useBatches';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TestType } from '@prime/shared-types';

export const EditTestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: test, isLoading } = useTest(id!);
  const updateMutation = useUpdateTest();
  const { data: batchesData } = useBatches({ limit: 100 });
  const batches = batchesData?.data || [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (test) {
      reset({
        name: test.name,
        testType: test.testType,
        batchId: test.batch.id, // cannot change batch after creation easily in UI, but show it disabled
        totalMarks: test.totalMarks,
        durationMinutes: test.durationMinutes || '',
        testDate: new Date(test.testDate).toISOString().split('T')[0],
      });
    }
  }, [test, reset]);

  const onSubmit = (data: any) => {
    const payload = {
      name: data.name,
      testType: data.testType,
      totalMarks: Number(data.totalMarks),
      durationMinutes: Number(data.durationMinutes) || undefined,
      testDate: data.testDate,
    };
    
    updateMutation.mutate({ id: id!, data: payload }, {
      onSuccess: () => navigate(`/tests/${id}`),
    });
  };

  if (isLoading || !test) return <LoadingSpinner size="lg" className="py-20" />;

  const isPublished = test.status === 'PUBLISHED';

  return (
    <div id="edit-test-page" className="max-w-3xl">
      <PageHeader title="Edit Test" description="Update test details" />

      {isPublished && (
        <div className="mb-6 p-4 bg-warning-50 border border-warning-200 rounded-lg text-warning-800 text-sm">
          This test is already published. Only minor details can be edited. Marks and Rankings cannot be changed.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="label">Test Name *</label>
            <input {...register('name', { required: 'Name is required' })} className={`input ${errors.name ? 'input-error' : ''}`} />
          </div>

          <div>
            <label className="label">Test Type *</label>
            <select {...register('testType')} className="input" disabled={isPublished}>
              {Object.values(TestType).map(t => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Batch</label>
            <select {...register('batchId')} className="input" disabled>
              {batches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Batch cannot be changed after creation</p>
          </div>

          <div>
            <label className="label">Total Marks *</label>
            <input type="number" {...register('totalMarks', { required: true, min: 1 })} className="input" disabled={isPublished || test.marksCount > 0} />
            {(isPublished || test.marksCount > 0) && <p className="text-xs text-gray-400 mt-1">Cannot change max marks after marks are entered</p>}
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
          <button type="button" onClick={() => navigate(`/tests/${id}`)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
