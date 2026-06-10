import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCreateStudent } from '@/hooks/useStudents';
import { PageHeader } from '@/components/ui/PageHeader';

export const CreateStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateStudent();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: '', lastName: '', dob: '', gender: 'MALE', schoolName: '',
      classStudying: '', targetExam: [] as string[],
      street: '', city: '', state: '', pincode: '',
      parentName: '', parentPhone: '', parentEmail: '',
      batchId: '',
    },
  });

  const onSubmit = (data: any) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      dob: data.dob,
      gender: data.gender,
      schoolName: data.schoolName,
      classStudying: data.classStudying,
      targetExam: data.targetExam,
      address: { street: data.street, city: data.city, state: data.state, pincode: data.pincode },
      ...(data.parentName && { parentName: data.parentName }),
      ...(data.parentPhone && { parentPhone: data.parentPhone }),
      ...(data.parentEmail && { parentEmail: data.parentEmail }),
      ...(data.batchId && { batchId: data.batchId }),
    };
    createMutation.mutate(payload, { onSuccess: () => navigate('/students') });
  };

  const fieldClass = (field: string) =>
    `input ${(errors as any)[field] ? 'input-error' : ''}`;

  return (
    <div id="create-student-page">
      <button onClick={() => navigate('/students')} className="btn-ghost mb-4 gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Students
      </button>

      <PageHeader title="Create Student" description="Add a new student to the system" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        {/* Personal Info */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input className={fieldClass('firstName')} placeholder="Arjun" {...register('firstName', { required: 'Required' })} />
              {errors.firstName && <p className="mt-1 text-xs text-danger-500">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input className={fieldClass('lastName')} placeholder="Singh" {...register('lastName', { required: 'Required' })} />
              {errors.lastName && <p className="mt-1 text-xs text-danger-500">{errors.lastName.message}</p>}
            </div>
            <div>
              <label className="label">Date of Birth *</label>
              <input type="date" className={fieldClass('dob')} {...register('dob', { required: 'Required' })} />
              {errors.dob && <p className="mt-1 text-xs text-danger-500">{errors.dob.message}</p>}
            </div>
            <div>
              <label className="label">Gender *</label>
              <select className="input" {...register('gender')}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="label">School Name *</label>
              <input className={fieldClass('schoolName')} placeholder="Delhi Public School" {...register('schoolName', { required: 'Required' })} />
            </div>
            <div>
              <label className="label">Class Studying *</label>
              <input className={fieldClass('classStudying')} placeholder="Class 6" {...register('classStudying', { required: 'Required' })} />
            </div>
          </div>

          <div className="mt-4">
            <label className="label">Target Exams</label>
            <div className="flex flex-wrap gap-3">
              {['SAINIK', 'RMS', 'RIMC', 'SCHOLARSHIP', 'FOUNDATION'].map((exam) => (
                <label key={exam} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" value={exam} className="w-4 h-4 rounded border-gray-300 text-primary-700" {...register('targetExam')} />
                  <span className="text-sm text-gray-700">{exam}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Street *</label>
              <input className={fieldClass('street')} placeholder="123 Main Street" {...register('street', { required: 'Required' })} />
            </div>
            <div>
              <label className="label">City *</label>
              <input className={fieldClass('city')} placeholder="Lucknow" {...register('city', { required: 'Required' })} />
            </div>
            <div>
              <label className="label">State *</label>
              <input className={fieldClass('state')} placeholder="Uttar Pradesh" {...register('state', { required: 'Required' })} />
            </div>
            <div>
              <label className="label">Pincode *</label>
              <input className={fieldClass('pincode')} placeholder="226001" maxLength={6} {...register('pincode', { required: 'Required', minLength: { value: 6, message: '6 digits' } })} />
            </div>
          </div>
        </div>

        {/* Parent Info */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Parent / Guardian (Optional)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Parent Name</label>
              <input className="input" placeholder="Rajesh Singh" {...register('parentName')} />
            </div>
            <div>
              <label className="label">Parent Phone</label>
              <input className="input" placeholder="9876543210" {...register('parentPhone')} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : 'Create Student'}
          </button>
          <button type="button" onClick={() => navigate('/students')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
