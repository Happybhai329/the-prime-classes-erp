import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useTest, useEnterMarks } from '@/hooks/useTests';
import { useBatches } from '@/hooks/useBatches'; // Needed to fetch students in the batch
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const EnterMarksPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: test, isLoading: isTestLoading } = useTest(id!);
  const enterMarksMutation = useEnterMarks();

  // We need the batch's students to render the list. The test API doesn't return students who haven't been marked yet.
  const { data: batchesData, isLoading: isBatchLoading } = useBatches({ limit: 100 });
  
  const [marksState, setMarksState] = useState<Record<string, { marksObtained: string; isAbsent: boolean }>>({});

  useEffect(() => {
    if (test && batchesData) {
      const batch = batchesData.data.find((b: any) => b.id === test.batch.id);
      if (batch) {
        const initialState: Record<string, { marksObtained: string; isAbsent: boolean }> = {};
        
        // Initialize with existing marks or default values
        batch.students?.forEach((s: any) => {
          const existingMark = test.marks.find((m: any) => m.studentId === s.studentId);
          initialState[s.studentId] = {
            marksObtained: existingMark ? existingMark.marksObtained.toString() : '',
            isAbsent: existingMark ? existingMark.isAbsent : false,
          };
        });
        
        setMarksState(initialState);
      }
    }
  }, [test, batchesData]);

  if (isTestLoading || isBatchLoading || !test) return <LoadingSpinner size="lg" className="py-20" />;

  const batch = batchesData?.data.find((b: any) => b.id === test.batch.id);
  const students = batch?.students || [];

  const handleMarkChange = (studentId: string, value: string) => {
    // Basic validation: max marks
    let numValue = Number(value);
    if (!isNaN(numValue) && numValue > test.totalMarks) {
      numValue = test.totalMarks;
      value = numValue.toString();
    }
    if (!isNaN(numValue) && numValue < 0) {
      value = '0';
    }

    setMarksState(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], marksObtained: value }
    }));
  };

  const handleAbsentToggle = (studentId: string) => {
    setMarksState(prev => ({
      ...prev,
      [studentId]: { 
        ...prev[studentId], 
        isAbsent: !prev[studentId].isAbsent,
        marksObtained: !prev[studentId].isAbsent ? '0' : prev[studentId].marksObtained // clear marks if setting to absent
      }
    }));
  };

  const handleSubmit = () => {
    const marksData = Object.entries(marksState)
      .filter(([_, state]) => state.marksObtained !== '' || state.isAbsent)
      .map(([studentId, state]) => ({
        studentId,
        marksObtained: state.isAbsent ? 0 : Number(state.marksObtained),
        isAbsent: state.isAbsent,
      }));

    if (marksData.length === 0) return;

    enterMarksMutation.mutate({ id: test.id, data: { marks: marksData } }, {
      onSuccess: () => navigate(`/tests/${test.id}`),
    });
  };

  return (
    <div id="enter-marks-page">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/tests/${test.id}`)} className="btn-ghost btn-sm p-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enter Marks: {test.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Max Marks: {test.totalMarks} • Batch: {test.batch.name}
            </p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={enterMarksMutation.isPending}
          className="btn-primary gap-2"
        >
          <Save className="h-4 w-4" />
          {enterMarksMutation.isPending ? 'Saving...' : 'Save Marks'}
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="table-container border-0 rounded-none">
          <table className="table">
            <thead>
              <tr>
                <th className="w-24">Roll #</th>
                <th>Student Name</th>
                <th className="w-32 text-center">Absent</th>
                <th className="w-48 text-right">Marks Obtained</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s: any) => {
                const student = s.student;
                const state = marksState[student.id] || { marksObtained: '', isAbsent: false };
                
                return (
                  <tr key={student.id} className={state.isAbsent ? 'bg-danger-50/30' : ''}>
                    <td className="font-medium text-gray-600">{student.rollNumber}</td>
                    <td className="font-medium text-gray-900">{student.firstName} {student.lastName}</td>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={state.isAbsent}
                        onChange={() => handleAbsentToggle(student.id)}
                        className="w-4 h-4 rounded border-gray-300 text-danger-600 focus:ring-danger-500 cursor-pointer"
                      />
                    </td>
                    <td>
                      <div className="flex justify-end">
                        <input
                          type="number"
                          value={state.marksObtained}
                          onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          disabled={state.isAbsent}
                          placeholder="-"
                          className="w-24 px-3 py-1.5 text-right border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No students found in this batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
