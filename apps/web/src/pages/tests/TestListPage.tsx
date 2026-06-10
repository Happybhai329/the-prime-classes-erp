import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BarChart2 } from 'lucide-react';
import { useTestList, useDeleteTest } from '@/hooks/useTests';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TestStatus, TestType } from '@prime/shared-types';

const statusOptions = Object.values(TestStatus).map(s => ({ value: s, label: s }));
const typeOptions = Object.values(TestType).map(t => ({ value: t, label: t.replace('_', ' ') }));

export const TestListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>();
  const [testType, setTestType] = useState<string | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useTestList({ page, limit: 20, status, testType });
  const deleteMutation = useDeleteTest();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-700';
      case 'SCHEDULED': return 'bg-primary-100 text-primary-700';
      case 'ONGOING': return 'bg-warning-100 text-warning-700';
      case 'COMPLETED': return 'bg-accent-100 text-accent-700';
      case 'PUBLISHED': return 'bg-success-100 text-success-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Test Name',
      render: (t: any) => (
        <div>
          <p className="font-medium text-gray-900">{t.name}</p>
          <p className="text-xs text-gray-500">{t.testType.replace('_', ' ')} • {t.totalMarks} Marks</p>
        </div>
      ),
    },
    {
      key: 'batch',
      header: 'Batch',
      render: (t: any) => <span className="badge-primary">{t.batchName}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      render: (t: any) => <span className="text-sm">{new Date(t.testDate).toLocaleDateString()}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (t: any) => (
        <span className={`badge ${getStatusColor(t.status)}`}>
          {t.status}
        </span>
      ),
    },
    {
      key: 'stats',
      header: 'Marks Entered',
      render: (t: any) => (
        <span className="text-sm font-medium text-gray-600">{t.marksCount} students</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (t: any) => (
        <div className="flex gap-1">
          {t.status === 'PUBLISHED' ? (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/tests/${t.id}/merit-list`); }}
              className="btn-ghost btn-sm text-xs text-primary-600"
            >
              <BarChart2 className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/tests/${t.id}/edit`); }}
              className="btn-ghost btn-sm text-xs"
            >
              Edit
            </button>
          )}
          {(t.status === 'DRAFT' || t.status === 'SCHEDULED') && (
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteId(t.id); }}
              className="btn-ghost btn-sm text-xs text-danger-600"
            >
              Del
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div id="test-list-page">
      <PageHeader
        title="Tests & Exams"
        description="Manage test schedules, enter marks, and publish results"
        actions={
          <button onClick={() => navigate('/tests/create')} className="btn-primary gap-2">
            <Plus className="h-4 w-4" />
            Create Test
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <FilterDropdown label="Status" options={statusOptions} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
        <FilterDropdown label="Test Type" options={typeOptions} value={testType} onChange={(v) => { setTestType(v); setPage(1); }} />
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyTitle="No tests found"
        emptyDescription="Schedule your first test."
        onRowClick={(t: any) => navigate(`/tests/${t.id}`)}
      />

      {data?.meta && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
        title="Delete Test"
        message="Are you sure you want to delete this test? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
