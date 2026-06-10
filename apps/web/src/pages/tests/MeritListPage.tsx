import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Trophy } from 'lucide-react';
import { useMeritList } from '@/hooks/useTests';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { DataTable } from '@/components/ui/DataTable';

export const MeritListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useMeritList(id!);

  if (isLoading || !data) return <LoadingSpinner size="lg" className="py-20" />;

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 2: return 'bg-gray-200 text-gray-800 border border-gray-300';
      case 3: return 'bg-orange-100 text-orange-800 border border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const columns = [
    { 
      key: 'rank', 
      header: 'Rank', 
      className: 'w-24 text-center',
      render: (m: any) => (
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${getRankBadgeColor(m.rank)}`}>
          {m.rank}
        </span>
      ) 
    },
    { key: 'roll', header: 'Roll #', render: (m: any) => m.rollNumber },
    { 
      key: 'name', 
      header: 'Student Name', 
      render: (m: any) => (
        <span className="font-medium text-gray-900 flex items-center gap-2">
          {m.studentName}
          {m.rank === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
        </span>
      ) 
    },
    { key: 'marks', header: 'Marks', render: (m: any) => <span className="font-semibold">{m.marksObtained} / {m.totalMarks}</span> },
    { key: 'percentage', header: 'Percentage', render: (m: any) => <span>{m.percentage}%</span> },
    { key: 'percentile', header: 'Percentile', render: (m: any) => <span className="text-gray-500">{m.percentile}</span> },
    { 
      key: 'grade', 
      header: 'Grade', 
      render: (m: any) => (
        <span className={`font-bold ${m.grade.includes('A') ? 'text-success-600' : m.grade.includes('F') ? 'text-danger-600' : 'text-primary-600'}`}>
          {m.grade}
        </span>
      ) 
    },
  ];

  const handleExportCsv = () => {
    // Basic CSV generation
    const headers = ['Rank', 'Roll Number', 'Student Name', 'Marks Obtained', 'Total Marks', 'Percentage', 'Percentile', 'Grade'];
    const rows = data.items.map(m => [
      m.rank, m.rollNumber, m.studentName, m.marksObtained, m.totalMarks, m.percentage, m.percentile, m.grade
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Merit_List_${data.testName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="merit-list-page">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/tests/${id}`)} className="btn-ghost btn-sm p-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Merit List: {data.testName}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {data.batchName} • {data.totalStudents} Students Ranked • Generated: {new Date(data.generatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <button onClick={handleExportCsv} className="btn-secondary gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="card overflow-hidden">
        <DataTable
          columns={columns}
          data={data.items}
          emptyTitle="No rankings found"
          emptyDescription="Rankings have not been computed for this test yet."
        />
      </div>
    </div>
  );
};
