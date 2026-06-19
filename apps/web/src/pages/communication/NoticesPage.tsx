import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, Calendar, Clock, Eye } from 'lucide-react';
import { useNotices, useCreateNotice, useUpdateNotice, useDeleteNotice } from '@/hooks/useNotices';
import { useAuthStore } from '@/store/auth.store';
import { NoticePriority, NoticeTargetAudience } from '@prime/shared-types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface NoticeFormData {
  title: string;
  description: string;
  priority: NoticePriority;
  targetAudience: NoticeTargetAudience;
  publishDate: string;
  expiryDate?: string;
  batchIds?: string[];
}

export const NoticesPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user && ['SUPER_ADMIN', 'ADMIN', 'FACULTY'].includes(user.role);

  // Search/Filters states
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<NoticePriority | ''>('');
  const [targetAudience, setTargetAudience] = useState<NoticeTargetAudience | ''>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any | null>(null);
  const [viewingNotice, setViewingNotice] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Queries
  const { data, isLoading } = useNotices({
    page,
    limit,
    search: search || undefined,
    priority: priority || undefined,
    targetAudience: targetAudience || undefined,
  });



  const createMutation = useCreateNotice();
  const updateMutation = useUpdateNotice();
  const deleteMutation = useDeleteNotice();

  // Forms
  const { register: registerCreate, handleSubmit: handleSubmitCreate, reset: resetCreate, formState: { errors: createErrors } } = useForm<NoticeFormData>();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, formState: { errors: editErrors } } = useForm<NoticeFormData>();

  const notices = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const handleCreateSubmit = (formData: NoticeFormData) => {
    const payload = {
      ...formData,
      publishDate: new Date(formData.publishDate).toISOString(),
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
    };
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Notice created successfully');
        setIsCreateOpen(false);
        resetCreate();
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to create notice');
      },
    });
  };

  const handleEditSubmit = (formData: NoticeFormData) => {
    if (!editingNotice) return;
    const payload = {
      ...formData,
      publishDate: new Date(formData.publishDate).toISOString(),
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
    };
    updateMutation.mutate(
      { id: editingNotice.id, data: payload },
      {
        onSuccess: () => {
          toast.success('Notice updated successfully');
          setEditingNotice(null);
          resetEdit();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to update notice');
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success('Notice deleted successfully');
        setDeleteId(null);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to delete notice');
      },
    });
  };

  const openEditModal = (notice: any) => {
    setEditingNotice(notice);
    resetEdit({
      title: notice.title,
      description: notice.description,
      priority: notice.priority,
      targetAudience: notice.targetAudience,
      publishDate: new Date(notice.publishDate).toISOString().slice(0, 16),
      expiryDate: notice.expiryDate ? new Date(notice.expiryDate).toISOString().slice(0, 16) : '',
      batchIds: notice.batchIds || [],
    });
  };

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (n: any) => (
        <div>
          <div className="font-semibold text-gray-900">{n.title}</div>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{n.description}</p>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (n: any) => <StatusBadge status={n.priority} />,
    },
    {
      key: 'audience',
      header: 'Audience',
      render: (n: any) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700">
          {n.targetAudience}
        </span>
      ),
    },
    {
      key: 'publishDate',
      header: 'Publish Date',
      render: (n: any) => (
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          {new Date(n.publishDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (n: any) => (
        <span className={`inline-flex px-2 text-xs font-bold leading-5 rounded-full ${
          n.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {n.isPublished ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (n: any) => (
        <div className="flex gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => setViewingNotice(n)}
            className="p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
            title="View Details"
          >
            <Eye className="h-4.5 w-4.5" />
          </button>
          {isAdmin && (
            <>
              <button 
                onClick={() => openEditModal(n)}
                className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-gray-100 rounded transition-colors"
                title="Edit Notice"
              >
                <Edit className="h-4.5 w-4.5" />
              </button>
              <button 
                onClick={() => setDeleteId(n.id)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
                title="Delete Notice"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Notice Board" 
        description="Official updates and notifications from the administration desk"
        actions={
          isAdmin && (
            <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Notice
            </Button>
          )
        }
      />

      {/* Filter panel */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-96">
          <SearchInput
            placeholder="Search notices..."
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
          />
        </div>
        <div className="w-full md:w-auto flex flex-wrap gap-3 items-center justify-end">
          <FilterDropdown
            label="Priority"
            value={priority}
            onChange={(val) => { setPriority(val as NoticePriority | ''); setPage(1); }}
            options={Object.values(NoticePriority).map(p => ({ label: p, value: p }))}
          />
          <FilterDropdown
            label="Audience"
            value={targetAudience}
            onChange={(val) => { setTargetAudience(val as NoticeTargetAudience | ''); setPage(1); }}
            options={Object.values(NoticeTargetAudience).map(a => ({ label: a, value: a }))}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={notices}
          isLoading={isLoading}
          onRowClick={(row) => setViewingNotice(row)}
          emptyTitle="No Notices Found"
          emptyDescription="There are no notices to display."
        />
        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-end">
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Notice"
        size="lg"
      >
        <form onSubmit={handleSubmitCreate(handleCreateSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notice Title</label>
            <input
              type="text"
              className={`input w-full ${createErrors.title ? 'border-red-500' : ''}`}
              placeholder="E.g. Extra Physics coaching class schedule"
              {...registerCreate('title', { required: 'Title is required', minLength: { value: 5, message: 'Title must be at least 5 characters' } })}
            />
            {createErrors.title && <p className="text-red-500 text-xs mt-1">{createErrors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                className="input w-full"
                {...registerCreate('priority', { required: true })}
              >
                {Object.values(NoticePriority).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <select
                className="input w-full"
                {...registerCreate('targetAudience', { required: true })}
              >
                {Object.values(NoticeTargetAudience).map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date & Time</label>
              <input
                type="datetime-local"
                className="input w-full"
                required
                {...registerCreate('publishDate', { required: true })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date & Time (Optional)</label>
              <input
                type="datetime-local"
                className="input w-full"
                {...registerCreate('expiryDate')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notice Description</label>
            <textarea
              rows={6}
              className={`input w-full ${createErrors.description ? 'border-red-500' : ''}`}
              placeholder="Describe notice content..."
              {...registerCreate('description', { required: 'Description is required', minLength: { value: 10, message: 'Description must be at least 10 characters' } })}
            />
            {createErrors.description && <p className="text-red-500 text-xs mt-1">{createErrors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Notice
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={!!editingNotice}
        onClose={() => setEditingNotice(null)}
        title="Edit Notice"
        size="lg"
      >
        <form onSubmit={handleSubmitEdit(handleEditSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notice Title</label>
            <input
              type="text"
              className={`input w-full ${editErrors.title ? 'border-red-500' : ''}`}
              {...registerEdit('title', { required: 'Title is required', minLength: { value: 5, message: 'Title must be at least 5 characters' } })}
            />
            {editErrors.title && <p className="text-red-500 text-xs mt-1">{editErrors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select className="input w-full" {...registerEdit('priority', { required: true })}>
                {Object.values(NoticePriority).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <select className="input w-full" {...registerEdit('targetAudience', { required: true })}>
                {Object.values(NoticeTargetAudience).map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date & Time</label>
              <input
                type="datetime-local"
                className="input w-full"
                required
                {...registerEdit('publishDate', { required: true })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date & Time (Optional)</label>
              <input
                type="datetime-local"
                className="input w-full"
                {...registerEdit('expiryDate')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notice Description</label>
            <textarea
              rows={6}
              className={`input w-full ${editErrors.description ? 'border-red-500' : ''}`}
              {...registerEdit('description', { required: 'Description is required', minLength: { value: 10, message: 'Description must be at least 10 characters' } })}
            />
            {editErrors.description && <p className="text-red-500 text-xs mt-1">{editErrors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setEditingNotice(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        isOpen={!!viewingNotice}
        onClose={() => setViewingNotice(null)}
        title={viewingNotice?.title || 'Notice details'}
        size="md"
      >
        {viewingNotice && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 flex-wrap">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                viewingNotice.priority === NoticePriority.URGENT ? 'bg-red-100 text-red-800' : 
                viewingNotice.priority === NoticePriority.HIGH ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {viewingNotice.priority}
              </span>
              <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded bg-indigo-50 text-indigo-700">
                Audience: {viewingNotice.targetAudience}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Published: {new Date(viewingNotice.publishDate).toLocaleDateString()}
              </span>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{viewingNotice.description}</p>

            <div className="flex justify-end pt-4 border-t border-gray-100 no-print">
              <Button onClick={() => setViewingNotice(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Notice"
        message="Are you sure you want to permanently delete this notice? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
