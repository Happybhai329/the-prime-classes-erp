import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCreateFaculty } from '@/hooks/useFaculty';
import { PageHeader } from '@/components/ui/PageHeader';

interface FacultyFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  specializationString: string;
  qualification: string;
  joiningDate: string;
  salary: number;
}

export const CreateFacultyPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateFaculty();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FacultyFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      specializationString: '',
      qualification: '',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 0,
    },
  });

  const onSubmit = (data: FacultyFormValues) => {
    // Process specialization string to array
    const specialization = data.specializationString
      ? data.specializationString.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || undefined,
      password: data.password,
      specialization,
      qualification: data.qualification || undefined,
      joiningDate: data.joiningDate,
      salary: data.salary ? Number(data.salary) : undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: () => navigate('/faculty'),
    });
  };

  const fieldClass = (field: keyof FacultyFormValues) =>
    `input ${errors[field] ? 'input-error' : ''}`;

  return (
    <div id="create-faculty-page" className="space-y-6">
      <button onClick={() => navigate('/faculty')} className="btn-ghost gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Faculty List
      </button>

      <PageHeader
        title="Add Faculty Member"
        description="Create a new faculty profile and system login account"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        {/* Personal Details */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
            Personal Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input
                type="text"
                placeholder="e.g. Ramesh"
                className={fieldClass('firstName')}
                {...register('firstName', { required: 'First name is required' })}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-danger-500">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="label">Last Name *</label>
              <input
                type="text"
                placeholder="e.g. Kumar"
                className={fieldClass('lastName')}
                {...register('lastName', { required: 'Last name is required' })}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-danger-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Credentials & Contact */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
            Account Credentials & Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Email Address *</label>
              <input
                type="email"
                placeholder="e.g. ramesh@primeclasses.in"
                className={fieldClass('email')}
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-danger-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">Phone Number</label>
              <input
                type="text"
                placeholder="e.g. 9876543210"
                className={fieldClass('phone')}
                {...register('phone', {
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: '10-digit mobile number required',
                  },
                })}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-danger-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="label">Login Password *</label>
              <input
                type="password"
                placeholder="••••••••"
                className={fieldClass('password')}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters long',
                  },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-danger-500">{errors.password.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
            Professional Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Qualification</label>
              <input
                type="text"
                placeholder="e.g. M.Sc. Physics, B.Ed."
                className={fieldClass('qualification')}
                {...register('qualification')}
              />
            </div>

            <div>
              <label className="label">Specializations (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Physics, Mathematics, Science"
                className={fieldClass('specializationString')}
                {...register('specializationString')}
              />
            </div>

            <div>
              <label className="label">Joining Date *</label>
              <input
                type="date"
                className={fieldClass('joiningDate')}
                {...register('joiningDate', { required: 'Joining date is required' })}
              />
              {errors.joiningDate && (
                <p className="mt-1 text-xs text-danger-500">{errors.joiningDate.message}</p>
              )}
            </div>

            <div>
              <label className="label">Monthly Salary (INR)</label>
              <input
                type="number"
                placeholder="e.g. 50000"
                className={fieldClass('salary')}
                {...register('salary')}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="btn-primary"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Adding...
              </>
            ) : (
              'Create Faculty Profile'
            )}
          </button>
          <button type="button" onClick={() => navigate('/faculty')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
