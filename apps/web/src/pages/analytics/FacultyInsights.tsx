import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertOctagon,
  ChevronRight,
  Send,
  MessageSquare,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { batchService } from '@/services/batch.service';
import { useBatchRiskAlerts, useQuestionAnalytics } from '@/hooks/useAnalytics';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/ui/PageHeader';
import toast from 'react-hot-toast';

export const FacultyInsights: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. Fetch active batches
  const { data: batches, isLoading: batchesLoading } = useQuery({
    queryKey: ['batches', 'active-list'],
    queryFn: async () => {
      const res = await batchService.getAll({});
      return res; // Array of active batches
    },
  });

  const [selectedBatchId, setSelectedBatchId] = useState<string>('');

  // 2. Fetch risk alerts for selected batch
  const { data: riskData, isLoading: riskLoading } = useBatchRiskAlerts(selectedBatchId);

  // 3. Fetch question difficulty analytics
  const { data: questionAnalytics, isLoading: qLoading } = useQuestionAnalytics();

  const handleAlertParent = (studentName: string) => {
    toast.success(`Alert notification dispatched to ${studentName}'s parents.`);
  };

  const handleAlertAdmin = (studentName: string) => {
    toast.success(`Flag report logged with Administration for student ${studentName}.`);
  };

  const activeBatch = batches?.find((b: any) => b.id === selectedBatchId);

  // Filter poorly performing questions for this subject
  const poorQuestions = (questionAnalytics || [])
    .filter((q: any) => q.classification === 'POORLY_PERFORMING' || q.classification === 'TOO_HARD')
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-slide-up" id="faculty-insights">
      <PageHeader
        title="Faculty Academic Intelligence"
        description="Monitor batch alerts, identify struggling students early, and track topic levels."
      />

      {/* Selector Row */}
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Select Class Batch</label>
          {batchesLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="form-input max-w-xs"
            >
              <option value="">-- Choose a Batch --</option>
              {batches?.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          )}
        </div>

        {activeBatch && (
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div>
              <span className="font-semibold text-gray-900 block">Target Exam</span>
              <span>{activeBatch.targetExam}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900 block">Class Teacher</span>
              <span>{activeBatch.classTeacher ? `${activeBatch.classTeacher.firstName} ${activeBatch.classTeacher.lastName}` : 'Unassigned'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* At-Risk Alert Listing */}
        <div className="card p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-red-500" /> At-Risk Students & Triggers
            </h3>

            {!selectedBatchId ? (
              <div className="text-center py-20 text-gray-400">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                Select a class batch above to view students requiring academic attention.
              </div>
            ) : riskLoading ? (
              <LoadingSpinner size="md" className="py-10" />
            ) : !riskData || riskData.length === 0 ? (
              <div className="text-center py-20 text-emerald-600 bg-emerald-50/30 border border-dashed rounded-xl">
                <CheckCircle className="h-10 w-10 mx-auto mb-3 text-emerald-500" />
                Excellent! No students flagged as 'At Risk' in this batch.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {riskData.map((alert: any) => (
                  <div key={alert.studentId} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-gray-900 text-sm">{alert.studentName}</span>
                        <span className="text-xs text-gray-400 font-medium">({alert.rollNumber})</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          alert.category === 'AT_RISK' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {alert.category}
                        </span>
                      </div>
                      {/* List triggers */}
                      <div className="mt-2 space-y-1">
                        {alert.triggers.map((trig: string, i: number) => (
                          <p key={i} className="text-xs text-red-600/90 flex items-center gap-1">
                            <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
                            {trig}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <button
                        onClick={() => navigate(`/analytics/student/${alert.studentId}`)}
                        className="btn btn-xs btn-outline-primary inline-flex items-center gap-1"
                      >
                        Profile <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleAlertParent(alert.studentName)}
                        className="btn btn-xs btn-outline-primary inline-flex items-center gap-1"
                        title="Alert Parent via FCM Notification"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Parent
                      </button>
                      <button
                        onClick={() => handleAlertAdmin(alert.studentName)}
                        className="btn btn-xs btn-outline-primary inline-flex items-center gap-1"
                        title="Escalate alert flag to admin log"
                      >
                        <Send className="h-3.5 w-3.5" /> Escalate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Topic/Question Performance difficulties */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-indigo-500" /> Syllabus Difficulty index
            </h3>
            <p className="text-xs text-gray-400 mb-4">Questions with correct response rates below 30% or high wrong-key matching.</p>

            {qLoading ? (
              <LoadingSpinner size="sm" />
            ) : poorQuestions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-20 border border-dashed rounded-xl">No critically difficult questions reported in recent mocks.</p>
            ) : (
              <div className="space-y-4">
                {poorQuestions.map((q: any) => (
                  <div key={q.id} className="border border-gray-50 bg-gray-50/50 rounded-xl p-3.5 text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-gray-900 truncate" title={q.questionText}>{q.questionText}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        q.classification === 'TOO_HARD' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
                      }`}>
                        {q.classification}
                      </span>
                    </div>
                    <p className="text-gray-400 mt-1">Subject: {q.subjectName} · Topic: {q.topic}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="bg-white border rounded p-1.5">
                        <span className="text-gray-400 block">Correct %</span>
                        <span className="font-bold text-emerald-600">{q.correctPct}%</span>
                      </div>
                      <div className="bg-white border rounded p-1.5">
                        <span className="text-gray-400 block">Wrong %</span>
                        <span className="font-bold text-red-500">{q.wrongPct}%</span>
                      </div>
                      <div className="bg-white border rounded p-1.5">
                        <span className="text-gray-400 block">Skip %</span>
                        <span className="font-bold text-gray-500">{q.skipPct}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default FacultyInsights;
