import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useFacultyMember, useUpdateFaculty } from '@/hooks/useFaculty';
import { PageHeader } from '@/components/ui/PageHeader';

interface FacultyFormValues {
  firstName: string;
  lastName: string;
  specializationString: string;
  qualification: string;
  salary: number;
}

export const EditFacultyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: faculty, isLoading } = useFacultyMember(id || '');
  const updateMutation = useUpdateFaculty();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FacultyFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      specializationString: '',
      qualification: '',
      salary: 0,
    },
  });

  useEffect(() => {
    if (faculty) {
      setValue('firstName', faculty.firstName);
      setValue('lastName', faculty.lastName);
      setValue('specializationString', (faculty.specialization || []).join(', '));
      setValue('qualification', faculty.qualification || '');
      setValue('salary', faculty.salary ? Number(faculty.salary) : 0);
    }
  }, [faculty, setValue]);

  const onSubmit = (data: FacultyFormValues) => {
    if (!id) return;
    
    const specialization = data.specializationString
      ? data.specializationString.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      specialization,
      qualification: data.qualification || undefined,
      salary: data.salary ? Number(data.salary) : undefined,
    };

    updateMutation.mutate(
      { id, data: payload },
      { onSuccess: () => navigate(`/faculty/${id}`) }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const fieldClass = (field: keyof FacultyFormValues) =>
    `input ${errors[field] ? 'input-error' : ''}`;

  return (
    <div id="edit-faculty-page" className="space-y-6">
      <button onClick={() => navigate(`/faculty/${id}`)} className="btn-ghost gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Profile
      </button>

      <PageHeader
        title="Edit Faculty Profile"
        description={`Modify details for ${faculty?.firstName} ${faculty?.lastName} (${faculty?.employeeId})`}
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
                className={fieldClass('lastName')}
                {...register('lastName', { required: 'Last name is required' })}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-danger-500">{errors.lastName.message}</p>
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
                className={fieldClass('qualification')}
                {...register('qualification')}
              />
            </div>

            <div>
              <label className="label">Specializations (comma separated)</label>
              <input
                type="text"
                className={fieldClass('specializationString')}
                {...register('specializationString')}
              />
            </div>

            <div>
              <label className="label">Monthly Salary (INR)</label>
              <input
                type="number"
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
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
          <button type="button" onClick={() => navigate(`/faculty/${id}`)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
