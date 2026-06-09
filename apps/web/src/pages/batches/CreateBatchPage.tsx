import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCreateBatch } from '@/hooks/useBatches';
import { PageHeader } from '@/components/ui/PageHeader';

export const CreateBatchPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateBatch();

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      name: '', code: '', targetExam: 'SAINIK', academicYear: '2025-2026',
      startDate: '', endDate: '', maxStrength: 50,
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      startTime: '09:00', endTime: '13:00',
    },
  });

  const onSubmit = (data: any) => {
    const payload = {
      name: data.name,
      code: data.code,
      targetExam: data.targetExam,
      academicYear: data.academicYear,
      startDate: data.startDate,
      endDate: data.endDate,
      maxStrength: Number(data.maxStrength),
      timing: {
        days: data.days,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    };
    createMutation.mutate(payload, { onSuccess: () => navigate('/batches') });
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div id="create-batch-page">
      <button onClick={() => navigate('/batches')} className="btn-ghost mb-4 gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Batches
      </button>

      <PageHeader title="Create Batch" description="Configure a new batch for enrollment" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Batch Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Batch Name *</label>
              <input className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Sainik School Foundation 2025" {...register('name', { required: true })} />
            </div>
            <div>
              <label className="label">Batch Code *</label>
              <input className={`input ${errors.code ? 'input-error' : ''}`} placeholder="SSF-2025" {...register('code', { required: true })} />
            </div>
            <div>
              <label className="label">Academic Year *</label>
              <input className={`input ${errors.academicYear ? 'input-error' : ''}`} placeholder="2025-2026" {...register('academicYear', { required: true })} />
            </div>
            <div>
              <label className="label">Target Exam *</label>
              <select className="input" {...register('targetExam')}>
                <option value="SAINIK">Sainik School</option>
                <option value="RMS">RMS</option>
                <option value="RIMC">RIMC</option>
                <option value="SCHOLARSHIP">Scholarship</option>
                <option value="FOUNDATION">Foundation</option>
              </select>
            </div>
            <div>
              <label className="label">Max Strength</label>
              <input type="number" className="input" min="1" max="200" {...register('maxStrength')} />
            </div>
            <div>
              <label className="label">Start Date *</label>
              <input type="date" className={`input ${errors.startDate ? 'input-error' : ''}`} {...register('startDate', { required: true })} />
            </div>
            <div>
              <label className="label">End Date *</label>
              <input type="date" className={`input ${errors.endDate ? 'input-error' : ''}`} {...register('endDate', { required: true })} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Schedule & Timing</h3>
          
          <div className="mb-6">
            <label className="label">Class Days</label>
            <div className="flex flex-wrap gap-3">
              <Controller
                name="days"
                control={control}
                render={({ field }) => (
                  <>
                    {daysOfWeek.map((day) => (
                      <label key={day} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-primary-700"
                          checked={field.value.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) field.onChange([...field.value, day]);
                            else field.onChange(field.value.filter((d: string) => d !== day));
                          }}
                        />
                        <span className="text-sm font-medium text-gray-700">{day}</span>
                      </label>
                    ))}
                  </>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Time</label>
              <input type="time" className="input" {...register('startTime')} />
            </div>
            <div>
              <label className="label">End Time</label>
              <input type="time" className="input" {...register('endTime')} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : 'Create Batch'}
          </button>
          <button type="button" onClick={() => navigate('/batches')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};
