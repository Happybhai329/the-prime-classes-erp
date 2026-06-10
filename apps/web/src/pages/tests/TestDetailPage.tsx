import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTest, useComputeRankings, usePublishTest } from '@/hooks/useTests';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowLeft, Edit, Edit3, Calculator, Send } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';

export const TestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: test, isLoading } = useTest(id!);
  const computeMutation = useComputeRankings();
  const publishMutation = usePublishTest();

  if (isLoading || !test) return <LoadingSpinner size="lg" className="py-20" />;

  const marksColumns = [
    { key: 'roll', header: 'Roll #', render: (m: any) => m.rollNumber },
    { key: 'name', header: 'Student Name', render: (m: any) => <span className="font-medium text-gray-900">{m.studentName}</span> },
    { key: 'marks', header: 'Marks Obtained', render: (m: any) => m.isAbsent ? <span className="text-danger-600 font-medium">ABSENT</span> : <span className="font-bold text-gray-900">{m.marksObtained}</span> },
    { key: 'percentage', header: 'Percentage', render: (m: any) => m.isAbsent ? '-' : <span>{m.percentage}%</span> },
    { key: 'rank', header: 'Batch Rank', render: (m: any) => {
      const rank = test.rankings.find((r: any) => r.studentId === m.studentId)?.batchRank;
      return rank ? <span className="badge bg-primary-50 text-primary-700">Rank {rank}</span> : '-';
    }},
  ];

  return (
    <div id="test-detail-page">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/tests')} className="btn-ghost btn-sm p-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{test.name}</h1>
              <span className={`badge ${test.status === 'PUBLISHED' ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'}`}>
                {test.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {test.batch.name} • {test.testType.replace('_', ' ')} • {new Date(test.testDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {test.status !== 'PUBLISHED' && (
            <button onClick={() => navigate(`/tests/${test.id}/edit`)} className="btn-secondary gap-2">
              <Edit className="h-4 w-4" /> Edit
            </button>
          )}
          {test.status === 'PUBLISHED' && (
            <button onClick={() => navigate(`/tests/${test.id}/merit-list`)} className="btn-primary gap-2">
              View Merit List
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-5 md:col-span-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-2">
            <div><p className="text-xs text-gray-500 mb-1">Total Marks</p><p className="font-semibold text-gray-900">{test.totalMarks}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Duration</p><p className="font-semibold text-gray-900">{test.durationMinutes || '-'} mins</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Subjects</p><p className="font-semibold text-gray-900">{test.subjectNames.join(', ') || 'General'}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Created By</p><p className="font-semibold text-gray-900">{test.createdBy}</p></div>
          </div>
        </div>
        
        <div className="card p-5 flex flex-col justify-center">
          <p className="text-xs text-gray-500 mb-1 text-center">Marks Entered</p>
          <p className="text-3xl font-bold text-gray-900 text-center">{test.marksCount}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
          <h3 className="font-semibold text-gray-900">Student Marks ({test.marks.length})</h3>
          <div className="flex gap-2">
            {test.status !== 'PUBLISHED' && (
              <>
                <button onClick={() => navigate(`/tests/${test.id}/marks`)} className="btn-secondary btn-sm gap-2">
                  <Edit3 className="h-4 w-4" /> {test.marks.length > 0 ? 'Edit Marks' : 'Enter Marks'}
                </button>
                <button 
                  onClick={() => computeMutation.mutate(test.id)} 
                  disabled={test.marks.length === 0 || computeMutation.isPending}
                  className="btn-secondary btn-sm gap-2"
                >
                  <Calculator className="h-4 w-4" /> Compute Ranks
                </button>
                <button 
                  onClick={() => publishMutation.mutate(test.id)} 
                  disabled={!test.rankingsComputed || publishMutation.isPending}
                  className="btn-primary btn-sm gap-2"
                >
                  <Send className="h-4 w-4" /> Publish Results
                </button>
              </>
            )}
          </div>
        </div>
        <DataTable
          columns={marksColumns}
          data={test.marks}
          emptyTitle="No marks entered yet"
          emptyDescription="Click 'Enter Marks' to start."
        />
      </div>
    </div>
  );
};
