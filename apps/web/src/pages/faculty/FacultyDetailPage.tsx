import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  IndianRupee,
  Plus,
  Trash2,
  Loader2,
  BookOpen,
} from 'lucide-react';
import {
  useFacultyMember,
  useAssignFacultyBatch,
  useRemoveFacultyBatch,
} from '@/hooks/useFaculty';
import { useBatches } from '@/hooks/useBatches';
import { useSubjects } from '@/hooks/useSubjects';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const FacultyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [removeAssignmentId, setRemoveAssignmentId] = useState<string | null>(null);

  const { data: faculty, isLoading: isFacultyLoading } = useFacultyMember(id || '');
  const { data: batchesData } = useBatches({ limit: 100, isActive: true });
  const { data: subjectsData } = useSubjects({ limit: 100 });

  const assignMutation = useAssignFacultyBatch();
  const removeMutation = useRemoveFacultyBatch();

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedBatchId || !selectedSubjectId) return;

    assignMutation.mutate(
      {
        id,
        batchId: selectedBatchId,
        subjectId: selectedSubjectId,
      },
      {
        onSuccess: () => {
          setSelectedBatchId('');
          setSelectedSubjectId('');
        },
      }
    );
  };

  const handleRemoveAssignment = () => {
    if (!id || !removeAssignmentId) return;

    removeMutation.mutate(
      {
        id,
        batchSubjectId: removeAssignmentId,
      },
      {
        onSuccess: () => {
          setRemoveAssignmentId(null);
        },
      }
    );
  };

  if (isFacultyLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Faculty profile not found</h3>
        <button onClick={() => navigate('/faculty')} className="btn-primary mt-4">
          Back to Faculty
        </button>
      </div>
    );
  }

  const assignments = faculty.batchSubjects || [];
  const batches = batchesData?.data || [];
  const subjects = subjectsData?.data || [];

  return (
    <div id="faculty-detail-page" className="space-y-6">
      <button onClick={() => navigate('/faculty')} className="btn-ghost gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Faculty List
      </button>

      {/* Header Profile Summary */}
      <div className="card p-6 relative overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {faculty.firstName} {faculty.lastName}
              </h2>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                {faculty.employeeId}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-gray-400" /> {faculty.user?.email}
              {faculty.user?.phone && (
                <>
                  <span className="text-gray-300">•</span>
                  <Phone className="h-4 w-4 text-gray-400" /> {faculty.user?.phone}
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={() => navigate(`/faculty/${faculty.id}/edit`)}
              className="btn-secondary text-sm"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats and metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-500 font-semibold block uppercase tracking-wider">
              Specialization
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {(faculty.specialization || []).map((spec: string) => (
                <span key={spec} className="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 font-medium">
                  {spec}
                </span>
              ))}
              {(!faculty.specialization || faculty.specialization.length === 0) && (
                <span className="text-gray-400 text-sm">—</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-500 font-semibold block uppercase tracking-wider">
              Qualification
            </span>
            <span className="text-sm font-medium text-gray-900 block mt-1">
              {faculty.qualification || '—'}
            </span>
          </div>

          <div>
            <span className="text-xs text-gray-500 font-semibold block uppercase tracking-wider">
              Joining Date
            </span>
            <span className="text-sm font-medium text-gray-900 block mt-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              {new Date(faculty.joiningDate).toLocaleDateString()}
            </span>
          </div>

          <div>
            <span className="text-xs text-gray-500 font-semibold block uppercase tracking-wider">
              Salary (Monthly)
            </span>
            <span className="text-sm font-medium text-gray-900 block mt-1 flex items-center gap-0.5">
              <IndianRupee className="h-3.5 w-3.5 text-gray-400" />
              {faculty.salary ? Number(faculty.salary).toLocaleString() : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Assignments and Assign Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Current Assignments Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-indigo-500" /> Active Batch & Subject Assignments
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Batch Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Batch Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {assignments.map((asgn: any) => (
                    <tr key={asgn.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {asgn.batch?.name}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-500">
                        {asgn.batch?.code}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700 font-medium">
                          {asgn.subject?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <button
                          onClick={() => setRemoveAssignmentId(asgn.id)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-50"
                          title="Remove Assignment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {assignments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                        No active subject assignments. Assign a batch and subject using the panel on the right.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 col: Assign form */}
        <div className="space-y-4">
          <div className="card p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Plus className="h-5 w-5 text-indigo-500" /> Assign Batch & Subject
            </h3>

            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="label">Select Batch *</label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">-- Choose Batch --</option>
                  {batches.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Select Subject *</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">-- Choose Subject --</option>
                  {subjects.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={assignMutation.isPending || !selectedBatchId || !selectedSubjectId}
                className="btn-primary w-full gap-2 mt-4"
              >
                {assignMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Assign Class
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Remove Assignment Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!removeAssignmentId}
        onClose={() => setRemoveAssignmentId(null)}
        onConfirm={handleRemoveAssignment}
        title="Remove Batch Assignment"
        message="Are you sure you want to remove this batch and subject assignment from this faculty member?"
        confirmLabel="Remove"
        isDestructive
        isLoading={removeMutation.isPending}
      />
    </div>
  );
};
