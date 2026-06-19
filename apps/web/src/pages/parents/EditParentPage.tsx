import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useParent, useUpdateParent } from '@/hooks/useParents';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface EditParentFormData {
  fatherName: string;
  motherName?: string;
  fatherPhone: string;
  motherPhone?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  emergencyContact?: string;
}

export const EditParentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: parent, isLoading } = useParent(id!);
  const updateMutation = useUpdateParent();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditParentFormData>();

  useEffect(() => {
    if (parent) {
      reset({
        fatherName: parent.fatherName || '',
        motherName: parent.motherName || '',
        fatherPhone: parent.fatherPhone || '',
        motherPhone: parent.motherPhone || '',
        fatherOccupation: parent.fatherOccupation || '',
        motherOccupation: parent.motherOccupation || '',
        emergencyContact: parent.emergencyContact || '',
      });
    }
  }, [parent, reset]);

  const onSubmit = (data: EditParentFormData) => {
    // Filter out empty optional values or convert to null
    const payload = Object.fromEntries(
      Object.entries(data).map(([key, val]) => [key, val === '' ? null : val])
    );

    updateMutation.mutate(
      { id: id!, data: payload },
      {
        onSuccess: () => {
          navigate(`/parents/${id}`);
        },
      }
    );
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-96" />;
  }

  if (!parent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Parent profile not found.</p>
        <Button variant="secondary" onClick={() => navigate('/parents')} className="mt-4">
          Go back to Parents List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate(`/parents/${id}`)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-gray-500">Back to Parent Details</span>
      </div>

      <PageHeader 
        title="Edit Parent Profile" 
        description={`Modify information for Father: ${parent.fatherName || '—'}`}
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

        {/* Other Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
            Emergency & General Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Number</label>
            <input
              type="text"
              className="input w-full"
              placeholder="E.g. 9876543212"
              {...register('emergencyContact')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
          <Button variant="secondary" type="button" onClick={() => navigate(`/parents/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" className="flex items-center gap-2" isLoading={updateMutation.isPending}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
