import React from 'react';
import { useAnnouncements, useDeleteAnnouncement } from '@/hooks/useAnnouncements';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Trash2, Edit, Megaphone } from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { data, isLoading } = useAnnouncements();
  const deleteMutation = useDeleteAnnouncement();

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;

  const announcements = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Announcements" 
        description="Broadcast rich text announcements"
        actions={
          <Button onClick={() => alert('Navigate to create announcement')}>
            <Plus className="h-4 w-4 mr-2" /> New Announcement
          </Button>
        }
      />

      <div className="space-y-4">
        {announcements.map((announcement: any) => (
          <div key={announcement.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <div className="mt-1 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="badge bg-gray-100 text-gray-700">{announcement.category}</span>
                    <span>Published: {new Date(announcement.publishedAt).toLocaleString()}</span>
                  </div>
                  <div className="mt-4 text-gray-700 whitespace-pre-wrap">
                    {announcement.content}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-primary-600 rounded-full hover:bg-primary-50">
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this announcement?')) {
                      deleteMutation.mutate(announcement.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-12 bg-white shadow rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-500">No announcements found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
