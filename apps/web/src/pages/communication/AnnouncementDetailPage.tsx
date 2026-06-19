import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit, Trash2, Megaphone, Clock, Calendar, User } from 'lucide-react';
import { useAnnouncement, useDeleteAnnouncement } from '@/hooks/useAnnouncements';
import { useAuthStore } from '@/store/auth.store';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const AnnouncementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user && ['SUPER_ADMIN', 'ADMIN'].includes(user.role);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data, isLoading, error } = useAnnouncement(id || '');
  const deleteMutation = useDeleteAnnouncement();

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-semibold text-gray-900">Announcement not found</h3>
        <p className="text-gray-500 mb-4">The announcement you are looking for does not exist or has been deleted.</p>
        <Button onClick={() => navigate('/announcements')}>Go Back</Button>
      </div>
    );
  }

  const a = data;

  const handleDelete = () => {
    deleteMutation.mutate(a.id, {
      onSuccess: () => {
        toast.success('Announcement deleted successfully');
        navigate('/announcements');
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to delete announcement');
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
        title={a.title} 
        description={`Category: ${a.category}`}
        actions={
          isAdmin && (
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => navigate(`/announcements/${a.id}/edit`)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" /> Edit
              </Button>
              <Button 
                variant="danger" 
                onClick={() => setIsDeleteOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          )
        }
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b border-gray-100 pb-4">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <Megaphone className="w-3.5 h-3.5 mr-1" />
            {a.category}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            Published: {new Date(a.publishedAt || a.createdAt).toLocaleString()}
          </span>
          {a.scheduledAt && (
            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs border border-amber-100">
              <Clock className="w-3.5 h-3.5" />
              Scheduled: {new Date(a.scheduledAt).toLocaleString()}
            </span>
          )}
          {a.creator && (
            <span className="flex items-center gap-1">
              <User className="w-4 h-4 text-gray-400" />
              Author: {a.creator.faculty ? `${a.creator.faculty.firstName} ${a.creator.faculty.lastName}` : a.creator.email}
            </span>
          )}
        </div>

        <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">
          {a.content}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message="Are you sure you want to permanently delete this announcement? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
