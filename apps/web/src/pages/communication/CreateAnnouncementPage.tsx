import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { useCreateAnnouncement } from '@/hooks/useAnnouncements';
import { AnnouncementCategory } from '@prime/shared-types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';

interface CreateAnnouncementFormData {
  title: string;
  category: AnnouncementCategory;
  content: string;
  scheduledAt?: string;
}

export const CreateAnnouncementPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateAnnouncement();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateAnnouncementFormData>();

  const onSubmit = (data: CreateAnnouncementFormData) => {
    const payload = {
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Announcement created successfully');
        navigate('/announcements');
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to create announcement');
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate('/announcements')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-gray-500">Back to Announcements</span>
      </div>

      <PageHeader 
        title="New Announcement" 
        description="Create and broadcast a rich text announcement to all users"
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
            <Button variant="secondary" type="button" onClick={() => navigate('/announcements')}>
              Cancel
            </Button>
            <Button type="submit" className="flex items-center gap-2" isLoading={createMutation.isPending}>
              <Megaphone className="h-4 w-4" />
              Publish Announcement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
