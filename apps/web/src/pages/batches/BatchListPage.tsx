import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { useBatches, useDeleteBatch } from '@/hooks/useBatches';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const examOptions = [
  { value: 'SAINIK', label: 'Sainik School' },
  { value: 'RMS', label: 'RMS' },
  { value: 'RIMC', label: 'RIMC' },
  { value: 'SCHOLARSHIP', label: 'Scholarship' },
  { value: 'FOUNDATION', label: 'Foundation' },
];

const statusOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export const BatchListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [targetExam, setTargetExam] = useState<string | undefined>();
  const [isActive, setIsActive] = useState<string | undefined>('true');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useBatches({
    page, limit: 20, search, targetExam, 
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
  });
  const deleteMutation = useDeleteBatch();

  const columns = [
    {
      key: 'name',
      header: 'Batch Details',
      render: (b: any) => (
        <div>
          <p className="font-medium text-gray-900">{b.name}</p>
          <p className="text-xs text-gray-500">{b.code} · {b.academicYear}</p>
        </div>
      ),
    },
    {
      key: 'target',
      header: 'Target Exam',
      render: (b: any) => <span className="badge-primary">{b.targetExam}</span>,
    },
    {
      key: 'teacher',
      header: 'Class Teacher',
      render: (b: any) => b.classTeacher ? (
        <span className="text-sm">{b.classTeacher.firstName} {b.classTeacher.lastName}</span>
      ) : (
        <span className="text-xs text-gray-400">Unassigned</span>
      ),
    },
    {
      key: 'strength',
      header: 'Strength',
      render: (b: any) => (
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium">
            <span className={b.studentCount >= b.maxStrength ? 'text-amber-600' : 'text-gray-900'}>
              {b.studentCount}
            </span>
            <span className="text-gray-400"> / {b.maxStrength}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (b: any) => (
        <span className={`badge ${b.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
          {b.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-20',
      render: (b: any) => (
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/batches/${b.id}/edit`); }}
            className="btn-ghost btn-sm text-xs"
          >
            Edit
          </button>
          {b.isActive && (
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteId(b.id); }}
              className="btn-ghost btn-sm text-xs text-red-600"
            >
              Deactivate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div id="batch-list-page">
      <PageHeader
        title="Batches"
        description={`${data?.meta?.total || 0} batches found`}
        actions={
          <button onClick={() => navigate('/batches/create')} className="btn-primary gap-2">
            <Plus className="h-4 w-4" /> Create Batch
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or code..." className="flex-1 max-w-md" />
        <FilterDropdown label="Target Exam" options={examOptions} value={targetExam} onChange={(v) => { setTargetExam(v); setPage(1); }} />
        <FilterDropdown label="Status" options={statusOptions} value={isActive} onChange={(v) => { setIsActive(v); setPage(1); }} />
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyTitle="No batches found"
        emptyDescription="Create your first batch to start enrolling students."
        onRowClick={(b: any) => navigate(`/batches/${b.id}`)}
      />

      {data?.meta && (
        <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} className="mt-4" />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
        title="Deactivate Batch"
        message="Are you sure you want to deactivate this batch? Students will remain enrolled but the batch won't appear as active."
        confirmLabel="Deactivate"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
