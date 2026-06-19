import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useCreateParent } from '@/hooks/useParents';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';

interface CreateParentFormData {
  email: string;
  password?: string;
  fatherName: string;
  motherName?: string;
  fatherPhone: string;
  motherPhone?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  emergencyContact?: string;
}

export const CreateParentPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateParent();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateParentFormData>({
    defaultValues: {
      password: 'Prime@123',
    }
  });

  const onSubmit = (data: CreateParentFormData) => {
    // Filter out empty optional values
    const payload = Object.fromEntries(
      Object.entries(data).filter(([_, val]) => val !== '' && val !== undefined)
    );

    createMutation.mutate(payload, {
      onSuccess: (res: any) => {
        toast.success('Parent profile created successfully');
        navigate(`/parents/${res.id || ''}`);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to create parent profile');
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate('/parents')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-gray-500">Back to Parents</span>
      </div>

      <PageHeader 
        title="Register Parent / Guardian" 
        description="Create a new parent user account and associate details."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Father / Guardian Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
              Father / Primary Guardian Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name *</label>
              <input
                type="text"
                className={`input w-full ${errors.fatherName ? 'border-red-500' : ''}`}
                placeholder="E.g. Rajesh Kumar"
                {...register('fatherName', { required: 'Father Name is required' })}
              />
              {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father's Phone *</label>
              <input
                type="text"
                className={`input w-full ${errors.fatherPhone ? 'border-red-500' : ''}`}
                placeholder="E.g. 9876543210"
                {...register('fatherPhone', { required: 'Father Phone is required' })}
              />
              {errors.fatherPhone && <p className="text-red-500 text-xs mt-1">{errors.fatherPhone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father's Occupation</label>
              <input
                type="text"
                className="input w-full"
                placeholder="E.g. Government Service"
                {...register('fatherOccupation')}
              />
            </div>
          </div>

          {/* Mother Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
              Mother Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
              <input
                type="text"
                className="input w-full"
                placeholder="E.g. Sunita Kumar"
                {...register('motherName')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Phone</label>
              <input
                type="text"
                className="input w-full"
                placeholder="E.g. 9876543211"
                {...register('motherPhone')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Occupation</label>
              <input
                type="text"
                className="input w-full"
                placeholder="E.g. Homemaker"
                {...register('motherOccupation')}
              />
            </div>
          </div>
        </div>

        {/* Account Settings Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
            Account Credentials & Other Info
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                className={`input w-full ${errors.email ? 'border-red-500' : ''}`}
                placeholder="parent@example.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Password</label>
              <input
                type="text"
                className={`input w-full ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Default: Prime@123"
                {...register('password', {
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Number</label>
              <input
                type="text"
                className="input w-full"
                placeholder="E.g. 9876543212"
                {...register('emergencyContact')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
          <Button variant="secondary" type="button" onClick={() => navigate('/parents')}>
            Cancel
          </Button>
          <Button type="submit" className="flex items-center gap-2" isLoading={createMutation.isPending}>
            <UserPlus className="h-4 w-4" />
            Create Parent Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
