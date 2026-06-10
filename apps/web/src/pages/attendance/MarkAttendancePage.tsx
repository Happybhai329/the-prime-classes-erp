import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useForm, Controller } from 'react-form-hook'; // Standardized with react-hook-form in this app
import { useCreateAttendanceSession } from '@/hooks/useAttendance';
import { useBatches } from '@/hooks/useBatches';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AttendanceSessionType, AttendanceStatus } from '@prime/shared-types';

export const MarkAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedBatchId = searchParams.get('batchId');

  const [selectedBatchId, setSelectedBatchId] = useState<string>(preselectedBatchId || '');
  const [sessionType, setSessionType] = useState<AttendanceSessionType>(AttendanceSessionType.MORNING);
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});

  const { data: batchesData, isLoading: isLoadingBatches } = useBatches({ limit: 100 });
  const batches = batchesData?.data || [];
  
  const selectedBatch = batches.find(b => b.id === selectedBatchId);
  const createMutation = useCreateAttendanceSession();

  // Reset records when batch changes
  useEffect(() => {
    if (selectedBatch) {
      const initialRecords: Record<string, AttendanceStatus> = {};
      selectedBatch.students?.forEach((s: any) => {
        initialRecords[s.studentId] = AttendanceStatus.PRESENT; // Default to present
      });
      setRecords(initialRecords);
    } else {
      setRecords({});
    }
  }, [selectedBatchId, selectedBatch]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    if (!selectedBatch) return;
    const newRecords: Record<string, AttendanceStatus> = {};
    selectedBatch.students?.forEach((s: any) => {
      newRecords[s.studentId] = status;
    });
    setRecords(newRecords);
  };

  const handleSubmit = () => {
    if (!selectedBatchId) return;

    const payload = {
      batchId: selectedBatchId,
      sessionDate,
      sessionType,
      records: Object.entries(records).map(([studentId, status]) => ({
        studentId,
        status,
      })),
    };

    createMutation.mutate(payload as any, {
      onSuccess: () => {
        navigate('/attendance/history');
      },
    });
  };

  if (isLoadingBatches) return <LoadingSpinner size="lg" className="py-20" />;

  return (
    <div id="mark-attendance-page">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate('/attendance')} className="btn-ghost btn-sm p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">Select a batch to mark student attendance</p>
        </div>
      </div>

      <div className="card p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="label">Select Batch</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="input"
            >
              <option value="">-- Choose Batch --</option>
              {batches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Session Type</label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as AttendanceSessionType)}
              className="input"
            >
              <option value="MORNING">Morning (Daily)</option>
              <option value="EVENING">Evening (Daily)</option>
              <option value="SUBJECT">Subject-wise</option>
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="input"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      {selectedBatch && (
        <div className="card overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">
              Students in {selectedBatch.name}
              <span className="ml-2 badge bg-gray-200 text-gray-700">{selectedBatch.students?.length || 0}</span>
            </h3>
            <div className="flex gap-2">
              <button onClick={() => handleMarkAll(AttendanceStatus.PRESENT)} className="btn-sm btn-ghost text-success-600 hover:bg-success-50">
                Mark All Present
              </button>
              <button onClick={() => handleMarkAll(AttendanceStatus.ABSENT)} className="btn-sm btn-ghost text-danger-600 hover:bg-danger-50">
                Mark All Absent
              </button>
            </div>
          </div>

          <div className="table-container border-0 rounded-none">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-20">Roll #</th>
                  <th>Student Name</th>
                  <th className="w-64 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedBatch.students?.map((s: any) => {
                  const student = s.student;
                  const currentStatus = records[student.id];
                  
                  return (
                    <tr key={student.id}>
                      <td className="font-medium text-gray-600">{student.rollNumber}</td>
                      <td className="font-medium text-gray-900">{student.firstName} {student.lastName}</td>
                      <td>
                        <div className="flex justify-center p-1 bg-gray-100 rounded-lg">
                          <button
                            onClick={() => handleStatusChange(student.id, AttendanceStatus.PRESENT)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                              currentStatus === AttendanceStatus.PRESENT
                                ? 'bg-success-500 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            P
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.id, AttendanceStatus.ABSENT)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                              currentStatus === AttendanceStatus.ABSENT
                                ? 'bg-danger-500 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            A
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.id, AttendanceStatus.LATE)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                              currentStatus === AttendanceStatus.LATE
                                ? 'bg-warning-500 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            L
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.id, AttendanceStatus.LEAVE)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                              currentStatus === AttendanceStatus.LEAVE
                                ? 'bg-primary-500 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            LV
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(!selectedBatch.students || selectedBatch.students.length === 0) && (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">
                      No students enrolled in this batch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !selectedBatch.students?.length}
              className="btn-primary gap-2"
            >
              <Save className="h-4 w-4" />
              {createMutation.isPending ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
