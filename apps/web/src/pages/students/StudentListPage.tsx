import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import { useStudents, useDeleteStudent } from '@/hooks/useStudents';
import { studentService } from '@/services/student.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'PASSED_OUT', label: 'Passed Out' },
  { value: 'DROPPED', label: 'Dropped' },
];

const examOptions = [
  { value: 'SAINIK', label: 'Sainik School' },
  { value: 'RMS', label: 'RMS' },
  { value: 'RIMC', label: 'RIMC' },
  { value: 'SCHOLARSHIP', label: 'Scholarship' },
  { value: 'FOUNDATION', label: 'Foundation' },
];

export const StudentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>();
  const [targetExam, setTargetExam] = useState<string | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useStudents({
    page, limit: 20, search, status, targetExam,
  });
  const deleteMutation = useDeleteStudent();

  const handleExportCsv = async () => {
    try {
      const blob = await studentService.exportCsv({ status, targetExam });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students-export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      /* toast handled by interceptor */
    }
  };

  const columns = [
    {
      key: 'rollNumber',
      header: 'Roll #',
      render: (s: any) => (
        <span className="font-medium text-gray-900">{s.rollNumber}</span>
      ),
    },
    {
      key: 'name',
      header: 'Student Name',
      render: (s: any) => (
        <div>
          <p className="font-medium text-gray-900">{s.firstName} {s.lastName}</p>
          <p className="text-xs text-gray-500">{s.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'class',
      header: 'Class',
      render: (s: any) => <span className="text-sm">{s.classStudying || '—'}</span>,
    },
    {
      key: 'batch',
      header: 'Batch',
      render: (s: any) => {
        const activeBatch = s.batchEnrollments?.[0]?.batch;
        return activeBatch ? (
          <span className="badge-primary">{activeBatch.name}</span>
        ) : (
          <span className="text-gray-400 text-xs">Unassigned</span>
        );
      },
    },
    {
      key: 'targetExam',
      header: 'Target Exams',
      render: (s: any) => (
        <div className="flex flex-wrap gap-1">
          {(s.targetExam || []).map((exam: string) => (
            <span key={exam} className="badge bg-primary-50 text-primary-700 text-[10px]">
              {exam}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s: any) => <StatusBadge status={s.status} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-20',
      render: (s: any) => (
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/students/${s.id}/edit`); }}
            className="btn-ghost btn-sm text-xs"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteId(s.id); }}
            className="btn-ghost btn-sm text-xs text-red-600 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div id="student-list-page">
      <PageHeader
        title="Students"
        description={`${data?.meta?.total || 0} total students`}
        actions={
          <>
            <button onClick={handleExportCsv} className="btn-secondary gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button onClick={() => navigate('/students/create')} className="btn-primary gap-2">
              <Plus className="h-4 w-4" />
              Add Student
            </button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search by name or roll number..."
          className="flex-1 max-w-md"
        />
        <FilterDropdown label="Status" options={statusOptions} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
        <FilterDropdown label="Target Exam" options={examOptions} value={targetExam} onChange={(v) => { setTargetExam(v); setPage(1); }} />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyTitle="No students found"
        emptyDescription="Start by adding your first student."
        onRowClick={(s: any) => navigate(`/students/${s.id}`)}
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

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
          }
        }}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action will deactivate their account."
        confirmLabel="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
