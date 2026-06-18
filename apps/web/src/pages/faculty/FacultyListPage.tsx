import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserCheck, UserX } from 'lucide-react';
import { useFacultyList, useDeleteFaculty } from '@/hooks/useFaculty';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const FacultyListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useFacultyList({
    page,
    limit: 20,
    search,
  });

  const deleteMutation = useDeleteFaculty();

  const columns = [
    {
      key: 'employeeId',
      header: 'Emp ID',
      render: (f: any) => (
        <span className="font-mono text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
          {f.employeeId}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Faculty Name',
      render: (f: any) => (
        <div>
          <p className="font-medium text-gray-900">{f.firstName} {f.lastName}</p>
          <p className="text-xs text-gray-500">{f.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'specialization',
      header: 'Specialization',
      render: (f: any) => (
        <div className="flex flex-wrap gap-1">
          {(f.specialization || []).map((spec: string) => (
            <span key={spec} className="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 font-medium">
              {spec}
            </span>
          ))}
          {(!f.specialization || f.specialization.length === 0) && (
            <span className="text-gray-400 text-xs">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'classes',
      header: 'Assigned Batches',
      render: (f: any) => {
        const assignments = f.batchSubjects || [];
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {assignments.map((asgn: any) => (
              <span key={asgn.id} className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-mono">
                {asgn.batch?.code} • {asgn.subject?.name}
              </span>
            ))}
            {assignments.length === 0 && (
              <span className="text-gray-400 text-xs">Unassigned</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (f: any) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          f.user?.isActive 
            ? 'bg-emerald-50 text-emerald-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {f.user?.isActive ? (
            <UserCheck className="h-3 w-3" />
          ) : (
            <UserX className="h-3 w-3" />
          )}
          {f.user?.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-28 text-right',
      render: (f: any) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/faculty/${f.id}`)}
            className="btn-ghost btn-sm text-xs"
          >
            View
          </button>
          <button
            onClick={() => navigate(`/faculty/${f.id}/edit`)}
            className="btn-ghost btn-sm text-xs"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteId(f.id)}
            className="btn-ghost btn-sm text-xs text-red-600 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div id="faculty-list-page" className="space-y-6">
      <PageHeader
        title="Faculty Management"
        description={`${data?.meta?.total || 0} registered faculty members`}
        actions={
          <button onClick={() => navigate('/faculty/create')} className="btn-primary gap-2">
            <Plus className="h-4 w-4" />
            Add Faculty Member
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
          placeholder="Search by name, email, or employee ID..."
          className="flex-1 max-w-md"
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyTitle="No faculty found"
        emptyDescription="Start by adding your first faculty member."
        onRowClick={(f: any) => navigate(`/faculty/${f.id}`)}
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
        title="Remove Faculty Member"
        message="Are you sure you want to remove this faculty member? This will deactivate their user account."
        confirmLabel="Remove"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
