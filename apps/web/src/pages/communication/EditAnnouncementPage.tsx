import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { useAnnouncement, useUpdateAnnouncement } from '@/hooks/useAnnouncements';
import { AnnouncementCategory } from '@prime/shared-types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface EditAnnouncementFormData {
  title: string;
  category: AnnouncementCategory;
  content: string;
  scheduledAt?: string;
}

export const EditAnnouncementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useAnnouncement(id || '');
  const updateMutation = useUpdateAnnouncement();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditAnnouncementFormData>();

  useEffect(() => {
    if (data) {
      const a = data;
      reset({
        title: a.title,
        category: a.category,
        content: a.content,
        scheduledAt: a.scheduledAt ? new Date(a.scheduledAt).toISOString().slice(0, 16) : '',
      });
    }
  }, [data, reset]);

  const onSubmit = (formData: EditAnnouncementFormData) => {
    if (!id) return;
    const payload = {
      ...formData,
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : undefined,
    };

    updateMutation.mutate(
      { id, data: payload },
      {
        onSuccess: () => {
          toast.success('Announcement updated successfully');
          navigate(`/announcements/${id}`);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to update announcement');
        },
      }
    );
  };

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate(`/announcements/${id}`)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-gray-500">Back to Details</span>
      </div>

      <PageHeader 
        title="Edit Announcement" 
        description="Update the content, category, or publish schedule of this announcement"
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              className={`input w-full ${errors.title ? 'border-red-500' : ''}`}
              placeholder="E.g. Holiday Notice for Eid-ul-Fitr"
              {...register('title', { 
                required: 'Title is required', 
                minLength: { value: 5, message: 'Title must be at least 5 characters' } 
              })}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className={`input w-full ${errors.category ? 'border-red-500' : ''}`}
                {...register('category', { required: 'Category is required' })}
              >
                <option value="">Select Category</option>
                {Object.values(AnnouncementCategory).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Publish Time (Optional)</label>
              <input
                type="datetime-local"
                className="input w-full"
                {...register('scheduledAt')}
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Leave empty to publish immediately.</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Detail</label>
            <textarea
              rows={8}
              className={`input w-full ${errors.content ? 'border-red-500' : ''}`}
              placeholder="Write announcement details here..."
              {...register('content', { 
                required: 'Content is required', 
                minLength: { value: 10, message: 'Content must be at least 10 characters' } 
              })}
            />
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
            <Button variant="secondary" type="button" onClick={() => navigate(`/announcements/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" className="flex items-center gap-2" isLoading={updateMutation.isPending}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
