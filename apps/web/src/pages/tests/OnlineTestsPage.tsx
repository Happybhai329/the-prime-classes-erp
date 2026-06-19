import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/auth.store';
import { useOnlineTests, useCreateOnlineTest, useAutoGenerateTest, useDeleteOnlineTest, useStartAttempt } from '@/hooks/useOnlineTests';
import { useQuestions } from '@/hooks/useQuestions';
import { useBatches, useBatch } from '@/hooks/useBatches';
import { ClipboardList, Plus, Trash2, CheckCircle, Play, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { OnlineTestMode } from '@prime/shared-types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const OnlineTestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isStudent = user?.role === 'STUDENT';
  const isAdminOrFaculty = ['ADMIN', 'SUPER_ADMIN', 'FACULTY'].includes(user?.role || '');

  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAutoOpen, setIsAutoOpen] = useState(false);
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null);

  // Form states for Create Custom Test
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [createBatchId, setCreateBatchId] = useState('');
  const [createSubjectId, setCreateSubjectId] = useState('');
  const [testMode, setTestMode] = useState<OnlineTestMode>(OnlineTestMode.MOCK);
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [totalMarks, setTotalMarks] = useState('100');
  const [passingMarks, setPassingMarks] = useState('40');
  const [negativeMarking, setNegativeMarking] = useState('0.25');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Form states for Auto Generate Test
  const [easyPercent, setEasyPercent] = useState('40');
  const [mediumPercent, setMediumPercent] = useState('40');
  const [hardPercent, setHardPercent] = useState('20');

  // Queries
  const { data: testsData, isLoading: testsLoading } = useOnlineTests(
    isStudent ? undefined : (selectedBatchId ? { batchId: selectedBatchId } : undefined)
  );

  const { data: batchesData } = useBatches({ limit: 100 });
  const batches = batchesData?.data || [];

  // Get subjects of the batch selected in creation
  const { data: createBatchDetails } = useBatch(createBatchId);
  const batchSubjects = createBatchDetails?.subjects || [];

  // Get questions of selected subject for custom creation
  const { data: questionsData } = useQuestions(createSubjectId ? { subjectId: createSubjectId, limit: 100 } : undefined);
  const questions = questionsData?.data || [];

  // Mutations
  const createTestMutation = useCreateOnlineTest();
  const autoGenerateMutation = useAutoGenerateTest();
  const deleteTestMutation = useDeleteOnlineTest();
  const startAttemptMutation = useStartAttempt();

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !createBatchId || !scheduledStart || !scheduledEnd) {
      toast.error('Required fields are missing');
      return;
    }

    try {
      await createTestMutation.mutateAsync({
        title,
        description,
        batchId: createBatchId,
        subjectId: createSubjectId || undefined,
        testMode,
        durationMinutes: Number(durationMinutes),
        totalMarks: Number(totalMarks),
        passingMarks: Number(passingMarks),
        negativeMarking: Number(negativeMarking),
        scheduledStart: new Date(scheduledStart).toISOString(),
        scheduledEnd: new Date(scheduledEnd).toISOString(),
        questionIds: selectedQuestionIds,
        isPublished: true,
      });
      toast.success('Online test scheduled successfully');
      setIsCreateOpen(false);
      resetCustomForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create test');
    }
  };

  const handleAutoGenerateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !createBatchId || !createSubjectId || !scheduledStart || !scheduledEnd) {
      toast.error('Required fields are missing');
      return;
    }

    const sum = Number(easyPercent) + Number(mediumPercent) + Number(hardPercent);
    if (sum !== 100) {
      toast.error('Difficulty percentages must sum to 100%');
      return;
    }

    try {
      await autoGenerateMutation.mutateAsync({
        title,
        batchId: createBatchId,
        subjectId: createSubjectId,
        testMode,
        durationMinutes: Number(durationMinutes),
        totalMarks: Number(totalMarks),
        passingMarks: Number(passingMarks),
        negativeMarking: Number(negativeMarking),
        scheduledStart: new Date(scheduledStart).toISOString(),
        scheduledEnd: new Date(scheduledEnd).toISOString(),
        difficultyMix: {
          EASY: Number(easyPercent),
          MEDIUM: Number(mediumPercent),
          HARD: Number(hardPercent),
        },
      });
      toast.success('Test generated and scheduled successfully!');
      setIsAutoOpen(false);
      resetCustomForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to auto-generate test');
    }
  };

  const resetCustomForm = () => {
    setTitle('');
    setDescription('');
    setCreateBatchId('');
    setCreateSubjectId('');
    setTestMode(OnlineTestMode.MOCK);
    setDurationMinutes('60');
    setTotalMarks('100');
    setPassingMarks('40');
    setNegativeMarking('0.25');
    setScheduledStart('');
    setScheduledEnd('');
    setSelectedQuestionIds([]);
    setEasyPercent('40');
    setMediumPercent('40');
    setHardPercent('20');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTestId) return;
    try {
      await deleteTestMutation.mutateAsync(deleteTestId);
      toast.success('Test deleted');
      setDeleteTestId(null);
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleTakeExam = async (testId: string) => {
    try {
      const res = await startAttemptMutation.mutateAsync(testId);
      const attempt = res.data;
      navigate(`/online-tests/exam/${attempt.id}`);
      toast.success('Exam session started!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start exam');
    }
  };

  const toggleQuestionSelect = (qId: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  if (testsLoading) return <LoadingSpinner size="lg" className="py-20" />;

  const tests = testsData?.data || [];

  return (
    <div id="online-tests-page" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Online Testing Center"
          description={isStudent ? "Take online practice papers, live mocks and exams." : "Manage and auto-generate online mock exams."}
        />
        {isAdminOrFaculty && (
          <div className="flex gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => setIsAutoOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition"
            >
              <Settings className="h-4 w-4" /> Auto-Generate Test
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 transition shadow-sm"
            >
              <Plus className="h-4 w-4" /> Create Custom Test
            </button>
          </div>
        )}
      </div>

      {isAdminOrFaculty && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-400 uppercase">Filter Batch:</label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl focus:outline-none text-sm text-gray-600 bg-white"
          >
            <option value="">All Batches</option>
            {batches.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Tests Grid */}
      {tests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test: any) => {
            const hasStarted = new Date(test.scheduledStart) <= new Date();
            const hasEnded = new Date(test.scheduledEnd) < new Date();
            const attempt = test.attempts?.find((a: any) => a.studentId === user?.student?.id);
            const isCompleted = attempt?.status === 'COMPLETED' || attempt?.status === 'AUTO_SUBMITTED';

            return (
              <div
                key={test.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-600">
                        {test.testMode}
                      </span>
                      {hasEnded ? (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-red-500 bg-red-50 px-2 py-0.5 rounded">
                          Ended
                        </span>
                      ) : hasStarted ? (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded animate-pulse">
                          Live
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                          Scheduled
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-primary-600 transition">
                    {test.title}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 h-8">
                    {test.description || 'No instructions specified.'}
                  </p>

                  <div className="space-y-1.5 mb-4 border-t border-gray-50 pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Duration</span>
                      <span className="font-semibold text-gray-700">{test.durationMinutes} Mins</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Marks</span>
                      <span className="font-semibold text-gray-700">{test.totalMarks} Total</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Neg. Marking</span>
                      <span className="font-semibold text-red-500">-{test.negativeMarking} per wrong</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Start Date</span>
                      <span className="font-semibold text-gray-700">{new Date(test.scheduledStart).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex gap-2">
                  {isStudent ? (
                    isCompleted ? (
                      <div className="w-full text-center py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle className="h-4 w-4" /> Score: {attempt.scoreObtained} / {test.totalMarks} ({Math.round(attempt.accuracy || 0)}% acc)
                      </div>
                    ) : hasEnded ? (
                      <div className="w-full text-center py-2 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold">
                        Missed Exam
                      </div>
                    ) : (
                      <button
                        onClick={() => handleTakeExam(test.id)}
                        disabled={!hasStarted}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                      >
                        <Play className="h-3.5 w-3.5" /> {attempt ? 'Resume Test' : 'Take Exam'}
                      </button>
                    )
                  ) : (
                    <div className="w-full flex gap-2">
                      <div className="flex-1 text-center py-2 bg-gray-50 text-gray-500 rounded-xl text-xs font-medium border border-gray-100">
                        {test.attempts?.length || 0} Attended
                      </div>
                      <button
                        onClick={() => setDeleteTestId(test.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition border border-gray-100"
                        title="Delete Schedule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No Online Tests Scheduled"
          description={isStudent ? "Enjoy! You don't have any active tests right now." : "Click on Create Custom Test or Auto-Generate to create one."}
        />
      )}

      {/* Create Custom Test Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Schedule Custom Online Test</h3>
            <form onSubmit={handleCreateTest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Batch *</label>
                  <select
                    value={createBatchId}
                    required
                    onChange={(e) => setCreateBatchId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  >
                    <option value="">Select Batch</option>
                    {batches.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Subject (Optional)</label>
                  <select
                    value={createSubjectId}
                    onChange={(e) => setCreateSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    disabled={!createBatchId}
                  >
                    <option value="">All Subjects</option>
                    {batchSubjects.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Test Mode *</label>
                  <select
                    value={testMode}
                    onChange={(e) => setTestMode(e.target.value as OnlineTestMode)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  >
                    {Object.values(OnlineTestMode).map((mode) => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Duration (Minutes) *</label>
                  <input
                    type="number"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Total Marks *</label>
                  <input
                    type="number"
                    required
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Passing Marks *</label>
                  <input
                    type="number"
                    required
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Negative Marking Penalty *</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={negativeMarking}
                    onChange={(e) => setNegativeMarking(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledStart}
                    onChange={(e) => setScheduledStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">End Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledEnd}
                    onChange={(e) => setScheduledEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Custom Questions Selector */}
              {createSubjectId && (
                <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                  <h4 className="text-xs font-bold text-gray-700 flex justify-between items-center">
                    <span>Select Questions ({selectedQuestionIds.length} chosen)</span>
                    <span className="text-[10px] text-gray-400 uppercase">Subject Questions</span>
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {questions.map((q: any) => {
                      const selected = selectedQuestionIds.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => toggleQuestionSelect(q.id)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between gap-3 ${
                            selected
                              ? 'border-amber-300 bg-amber-50 text-amber-900'
                              : 'border-gray-100 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex-1 line-clamp-1">{q.questionText}</div>
                          <span className="font-semibold text-gray-500 shrink-0">{q.marks} Marks</span>
                        </div>
                      );
                    })}
                    {questions.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">No questions found in database for this subject.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTestMutation.isPending}
                  className="px-4 py-2 rounded-lg text-sm text-white bg-amber-500 hover:bg-amber-600 transition"
                >
                  {createTestMutation.isPending ? 'Scheduling...' : 'Schedule Custom Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto-Generate Test Modal */}
      {isAutoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Auto-Generate Mock Paper</h3>
            <form onSubmit={handleAutoGenerateTest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Test Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sainik Mathematics Mock"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Batch *</label>
                  <select
                    value={createBatchId}
                    required
                    onChange={(e) => setCreateBatchId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  >
                    <option value="">Select Batch</option>
                    {batches.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Subject *</label>
                  <select
                    value={createSubjectId}
                    required
                    onChange={(e) => setCreateSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    disabled={!createBatchId}
                  >
                    <option value="">Select Subject</option>
                    {batchSubjects.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Duration *</label>
                  <input
                    type="number"
                    required
                    placeholder="Mins"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Marks *</label>
                  <input
                    type="number"
                    required
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Neg. Mark *</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={negativeMarking}
                    onChange={(e) => setNegativeMarking(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Difficulty Mix */}
              <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                <h4 className="text-xs font-bold text-gray-700 flex justify-between items-center">
                  <span>Difficulty Mix Weight (%)</span>
                  <span className="text-[10px] text-gray-400 uppercase">Must Sum to 100%</span>
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Easy (%)</label>
                    <input
                      type="number"
                      required
                      value={easyPercent}
                      onChange={(e) => setEasyPercent(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Medium (%)</label>
                    <input
                      type="number"
                      required
                      value={mediumPercent}
                      onChange={(e) => setMediumPercent(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Hard (%)</label>
                    <input
                      type="number"
                      required
                      value={hardPercent}
                      onChange={(e) => setHardPercent(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledStart}
                    onChange={(e) => setScheduledStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">End Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledEnd}
                    onChange={(e) => setScheduledEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAutoOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={autoGenerateMutation.isPending}
                  className="px-4 py-2 rounded-lg text-sm text-white bg-primary-600 hover:bg-primary-700 transition"
                >
                  {autoGenerateMutation.isPending ? 'Generating Mock...' : 'Generate & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTestId}
        onClose={() => setDeleteTestId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Test Schedule"
        message="Are you sure you want to permanently delete this test schedule? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
        isLoading={deleteTestMutation.isPending}
      />
    </div>
  );
};
