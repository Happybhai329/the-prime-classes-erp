import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParents } from '@/hooks/useParents';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';

export const ParentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useParents({ page, limit: 20, search });

  const columns = [
    {
      key: 'father',
      header: 'Father / Primary Guardian',
      render: (p: any) => (
        <div>
          <p className="font-medium text-gray-900">{p.fatherName || '—'}</p>
          <p className="text-xs text-gray-500">{p.fatherPhone || '—'}</p>
        </div>
      ),
    },
    {
      key: 'mother',
      header: 'Mother',
      render: (p: any) => (
        <div>
          <p className="font-medium text-gray-900">{p.motherName || '—'}</p>
          <p className="text-xs text-gray-500">{p.motherPhone || '—'}</p>
        </div>
      ),
    },
    {
      key: 'account',
      header: 'Account',
      render: (p: any) => (
        <span className="text-sm text-gray-600">{p.user?.email || '—'}</span>
      ),
    },
    {
      key: 'students',
      header: 'Linked Students',
      render: (p: any) => (
        <div className="flex flex-col gap-1">
          {p.studentMappings?.map((sm: any) => (
            <span key={sm.student.id} className="text-sm font-medium text-primary-700">
              {sm.student.firstName} {sm.student.lastName}
            </span>
          ))}
          {!p.studentMappings?.length && <span className="text-gray-400 text-xs">None</span>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-16',
      render: (p: any) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/parents/${p.id}`); }}
          className="btn-ghost btn-sm text-xs"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div id="parent-list-page">
      <PageHeader
        title="Parents & Guardians"
        description={`${data?.meta?.total || 0} registered parents`}
        actions={
          <button
            onClick={() => navigate('/parents/create')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 transition shadow-sm"
          >
            Create Parent
          </button>
        }
      />

      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search by name or phone number..."
          className="max-w-md"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyTitle="No parents found"
        emptyDescription="Parent records are created automatically when adding students."
        onRowClick={(p: any) => navigate(`/parents/${p.id}`)}
      />

      {data?.meta && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
      )}
    </div>
  );
};
