import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
} from '@/hooks/useSubjects';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TargetExam } from '@prime/shared-types';

const examOptions = Object.values(TargetExam).map((val) => ({
  value: val,
  label: val.charAt(0) + val.slice(1).toLowerCase(),
}));

interface SubjectFormValues {
  name: string;
  code: string;
  targetExam: TargetExam[];
}

export const SubjectsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [targetExam, setTargetExam] = useState<string | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useSubjects({
    page,
    limit: 20,
    search,
    targetExam: targetExam as TargetExam,
  });

  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const deleteMutation = useDeleteSubject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    defaultValues: {
      name: '',
      code: '',
      targetExam: [],
    },
  });

  const handleOpenAddModal = () => {
    setEditSubject(null);
    reset({
      name: '',
      code: '',
      targetExam: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subject: any) => {
    setEditSubject(subject);
    reset({
      name: subject.name,
      code: subject.code,
      targetExam: subject.targetExam || [],
    });
    setIsModalOpen(true);
  };

  const onSubmitForm = (data: SubjectFormValues) => {
    if (editSubject) {
      updateMutation.mutate(
        { id: editSubject.id, data },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditSubject(null);
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
      });
    }
  };

  const columns = [
    {
      key: 'code',
      header: 'Subject Code',
      render: (s: any) => (
        <span className="font-mono text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
          {s.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Subject Name',
      render: (s: any) => <span className="font-medium text-gray-900">{s.name}</span>,
    },
    {
      key: 'targetExam',
      header: 'Target Exams',
      render: (s: any) => (
        <div className="flex flex-wrap gap-1">
          {(s.targetExam || []).map((exam: string) => (
            <span
              key={exam}
              className="px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700 font-medium"
            >
              {exam}
            </span>
          ))}
          {(!s.targetExam || s.targetExam.length === 0) && (
            <span className="text-gray-400 text-xs">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24 text-right',
      render: (s: any) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleOpenEditModal(s)}
            className="p-1 text-gray-500 hover:text-indigo-600 rounded hover:bg-gray-100"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteId(s.id)}
            className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div id="subjects-page" className="space-y-6">
      <PageHeader
        title="Subject Master"
        description="Configure academic subjects and map them to standard exams"
        actions={
          <button onClick={handleOpenAddModal} className="btn-primary gap-2">
            <Plus className="h-4 w-4" />
            Add Subject
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search subjects by name or code..."
          className="flex-1 max-w-md"
        />
        <FilterDropdown
          label="Target Exam"
          options={examOptions}
          value={targetExam}
          onChange={(v) => {
            setTargetExam(v);
            setPage(1);
          }}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyTitle="No subjects found"
        emptyDescription="Subject configurations mapped to exams will appear here."
      />

      {/* Pagination */}
      {data?.meta && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-gray-100 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {editSubject ? 'Edit Subject' : 'Add Subject'}
              </h3>
              <p className="text-sm text-gray-500">
                Define the subject details and exam targets
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
              <div>
                <label className="label">Subject Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics"
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  {...register('name', { required: 'Subject name is required' })}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-danger-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="label">Subject Code *</label>
                <input
                  type="text"
                  placeholder="e.g. MATH101"
                  className={`input ${errors.code ? 'input-error' : ''}`}
                  {...register('code', {
                    required: 'Subject code is required',
                    pattern: {
                      value: /^[A-Z0-9_-]+$/,
                      message: 'Uppercase alphanumeric, hyphens or underscores only',
                    },
                  })}
                />
                {errors.code && (
                  <p className="mt-1 text-xs text-danger-500">{errors.code.message}</p>
                )}
              </div>

              <div>
                <label className="label">Target Exams *</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {Object.values(TargetExam).map((exam) => (
                    <label key={exam} className="flex items-center gap-2 cursor-pointer p-1">
                      <input
                        type="checkbox"
                        value={exam}
                        className="w-4 h-4 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
                        {...register('targetExam', { required: 'Select at least one target exam' })}
                      />
                      <span className="text-sm text-gray-700">{exam}</span>
                    </label>
                  ))}
                </div>
                {errors.targetExam && (
                  <p className="mt-1 text-xs text-danger-500">{errors.targetExam.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editSubject ? (
                    'Save Changes'
                  ) : (
                    'Add Subject'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId, {
              onSuccess: () => setDeleteId(null),
            });
          }
        }}
        title="Delete Subject"
        message="Are you sure you want to delete this subject? It cannot be undone and will fail if the subject is assigned to batches."
        confirmLabel="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
