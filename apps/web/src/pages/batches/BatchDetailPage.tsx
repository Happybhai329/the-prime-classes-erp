import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Clock, Edit } from 'lucide-react';
import { useBatch, useRemoveStudentFromBatch } from '@/hooks/useBatches'; // Needs remove hook added
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { TabGroup } from '@/components/ui/TabGroup';

export const BatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students');
  const { data: batch, isLoading } = useBatch(id!);

  if (isLoading) return <LoadingSpinner size="lg" className="h-96" />;
  if (!batch) return null;

  return (
    <div id="batch-detail-page">
      <button onClick={() => navigate('/batches')} className="btn-ghost mb-4 gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Batches
      </button>

      {/* Header Card */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold text-gray-900">{batch.name}</h1>
              <span className={`badge ${batch.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                {batch.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{batch.code} · {batch.academicYear}</p>
            <div className="mt-3 inline-block">
              <span className="badge-primary">{batch.targetExam}</span>
            </div>
          </div>
          <button onClick={() => navigate(`/batches/${id}/edit`)} className="btn-secondary gap-2">
            <Edit className="h-4 w-4" /> Edit Batch
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Users className="h-3 w-3" /> Enrolled</p>
            <p className="font-medium text-gray-900">{batch.studentCount} / {batch.maxStrength}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Calendar className="h-3 w-3" /> Duration</p>
            <p className="font-medium text-gray-900 text-sm">
              {new Date(batch.startDate).toLocaleDateString('en-IN')} - {new Date(batch.endDate).toLocaleDateString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Clock className="h-3 w-3" /> Timing</p>
            <p className="font-medium text-gray-900 text-sm">
              {batch.timing?.startTime || '—'} to {batch.timing?.endTime || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Class Teacher</p>
            <p className="font-medium text-gray-900 text-sm">
              {batch.classTeacher ? `${batch.classTeacher.firstName} ${batch.classTeacher.lastName}` : 'Unassigned'}
            </p>
          </div>
        </div>
      </div>

      <TabGroup
        tabs={[
          { id: 'students', label: `Students (${batch.studentCount})` },
          { id: 'subjects', label: 'Subjects' },
          { id: 'schedule', label: 'Schedule' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      {activeTab === 'students' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-end">
            <button className="btn-primary btn-sm">Add Students</button>
          </div>
          {batch.students?.length > 0 ? (
            <table className="table">
              <thead><tr><th>Roll #</th><th>Name</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {batch.students.map((bs: any) => (
                  <tr key={bs.student.id}>
                    <td className="font-medium">{bs.student.rollNumber}</td>
                    <td>
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/students/${bs.student.id}`)}>
                        {bs.student.photoUrl ? (
                          <img src={bs.student.photoUrl} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                            {bs.student.firstName[0]}
                          </div>
                        )}
                        <span className="font-medium hover:text-primary-700">{bs.student.firstName} {bs.student.lastName}</span>
                      </div>
                    </td>
                    <td className="text-sm text-gray-500">{new Date(bs.joinedAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button className="text-xs text-red-600 hover:text-red-800 font-medium">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">No students enrolled yet.</div>
          )}
        </div>
      )}
      
      {activeTab === 'subjects' && (
        <div className="card p-8 text-center text-gray-500">
          Subject and Faculty mapping will be implemented in Phase 2.
        </div>
      )}
      
      {activeTab === 'schedule' && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Class Days</h3>
          <div className="flex flex-wrap gap-2">
            {batch.timing?.days?.map((day: string) => (
              <span key={day} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
                {day}
              </span>
            ))}
            {!batch.timing?.days?.length && <span className="text-gray-500 text-sm">No days configured</span>}
          </div>
        </div>
      )}
    </div>
  );
};
