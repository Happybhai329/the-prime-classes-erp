import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, Megaphone, Eye, Calendar } from 'lucide-react';
import { useAnnouncements, useDeleteAnnouncement } from '@/hooks/useAnnouncements';
import { useAuthStore } from '@/store/auth.store';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { Pagination } from '@/components/ui/Pagination';
import { AnnouncementCategory } from '@prime/shared-types';

export const AnnouncementsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user && ['SUPER_ADMIN', 'ADMIN'].includes(user.role);

  // States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory | ''>('');
  const [page, setPage] = useState(1);
  const limit = 5;

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // API hooks
  const queryParams = {
    search: search || undefined,
    category: category || undefined,
    page,
    limit,
  };

  const { data, isLoading } = useAnnouncements(queryParams);
  const deleteMutation = useDeleteAnnouncement();

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success('Announcement deleted successfully');
        setDeleteId(null);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to delete announcement');
      },
    });
  };

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;

  const announcements = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Announcements" 
        description="Broadcast rich text announcements to the student and parent community"
        actions={
          isAdmin && (
            <Button onClick={() => navigate('/announcements/create')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Announcement
            </Button>
          )
        }
      />

      {/* Filter panel */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search announcements..."
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
          />
        </div>
        <div className="w-full sm:w-auto flex items-center justify-end">
          <FilterDropdown
            label="Category"
            value={category}
            onChange={(val) => { setCategory(val as AnnouncementCategory | ''); setPage(1); }}
            options={Object.values(AnnouncementCategory).map(c => ({ label: c, value: c }))}
          />
        </div>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement: any) => (
          <div 
            key={announcement.id} 
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/announcements/${announcement.id}`)}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors">
                    {announcement.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                      {announcement.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(announcement.publishedAt || announcement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {announcement.content}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => navigate(`/announcements/${announcement.id}`)}
                  title="View Details"
                >
                  <Eye className="h-4.5 w-4.5" />
                </button>
                {isAdmin && (
                  <>
                    <button 
                      className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => navigate(`/announcements/${announcement.id}/edit`)}
                      title="Edit"
                    >
                      <Edit className="h-4.5 w-4.5" />
                    </button>
                    <button 
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setDeleteId(announcement.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
            <Megaphone className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-900">No Announcements</h3>
            <p className="text-xs text-gray-500 mt-1">There are no announcements matching your filters.</p>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-end pt-4">
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
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
