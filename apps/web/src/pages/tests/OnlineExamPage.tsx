import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOnlineTestDetails, useStartAttempt, useSaveAttemptState, useSubmitAttempt } from '@/hooks/useOnlineTests';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ChevronLeft, ChevronRight, ShieldAlert, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const OnlineExamPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<string, boolean>>({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({}); // questionId -> seconds

  const [timeLeft, setTimeLeft] = useState<number>(0); // overall seconds remaining
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Queries & Mutations
  const { data: test, isLoading: testLoading } = useOnlineTestDetails(testId || '');
  const startAttemptMutation = useStartAttempt();
  const saveStateMutation = useSaveAttemptState();
  const submitAttemptMutation = useSubmitAttempt();

  const timerRef = useRef<any>(null);
  const isSubmittingRef = useRef(false);

  // Start or resume attempt when test details are ready
  useEffect(() => {
    if (testId) {
      startAttemptMutation.mutate(testId, {
        onSuccess: (res: any) => {
          const attempt = res.data;
          setAttemptId(attempt.id);

          // Restore state if resumeState exists
          if (attempt.resumeState) {
            const state = attempt.resumeState;
            setSelectedAnswers(state.selectedAnswers || {});
            setVisitedQuestions(state.visitedQuestions || {});
            setMarkedForReview(state.markedForReview || {});
            setTimeSpent(state.timeSpent || {});
            setCurrentQIndex(state.currentQIndex || 0);
          }

          // Calculate initial remaining time
          const start = new Date(attempt.startedAt).getTime();
          const durationMs = test.durationMinutes * 60 * 1000;
          const elapsedMs = Date.now() - start;
          const remainingSec = Math.max(0, Math.floor((durationMs - elapsedMs) / 1000));
          setTimeLeft(remainingSec);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to start exam');
          navigate('/online-tests');
        },
      });
    }
  }, [testId, test]);

  // Request Fullscreen
  const enterFullscreen = () => {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    }
  };

  // Exit warning warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSubmittingRef.current) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your exam progress might be lost.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Timer loop
  useEffect(() => {
    if (timeLeft > 0 && attemptId) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });

        // Increment time spent on current question
        if (test?.questions?.[currentQIndex]) {
          const qId = test.questions[currentQIndex].questionId;
          setTimeSpent((prev) => ({
            ...prev,
            [qId]: (prev[qId] || 0) + 1,
          }));
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, attemptId, currentQIndex, test]);

  // Periodic autosave (every 10 seconds)
  useEffect(() => {
    if (!attemptId) return;

    const interval = setInterval(() => {
      saveExamState();
    }, 15000);

    return () => clearInterval(interval);
  }, [attemptId, selectedAnswers, visitedQuestions, markedForReview, timeSpent, currentQIndex]);

  const saveExamState = () => {
    if (!attemptId) return;
    saveStateMutation.mutate({
      attemptId,
      resumeState: {
        selectedAnswers,
        visitedQuestions,
        markedForReview,
        timeSpent,
        currentQIndex,
      },
    });
  };

  const handleAutoSubmit = () => {
    toast.error('Time is up! Submitting exam.');
    handleSubmitExam(true);
  };

  const handleSubmitExam = async (_force = false) => {
    if (!attemptId || !test) return;

    isSubmittingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      // Map response format
      const responses = test.questions.map((tq: any) => ({
        questionId: tq.questionId,
        selectedAnswer: selectedAnswers[tq.questionId] || undefined,
        timeSpentSeconds: timeSpent[tq.questionId] || 0,
      }));

      await submitAttemptMutation.mutateAsync({
        attemptId,
        responses,
      });

      toast.success('Exam submitted successfully!');
      
      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      
      navigate('/online-tests');
    } catch {
      toast.error('Failed to submit exam. Please try again.');
      isSubmittingRef.current = false;
    }
  };

  if (testLoading || !attemptId || !test) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  const questionsList = test.questions || [];
  const currentTQ = questionsList[currentQIndex];
  const currentQ = currentTQ?.question;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper colors for navigation grid
  const getGridColor = (idx: number, qId: string) => {
    if (idx === currentQIndex) return 'border-2 border-primary-500 font-bold';
    if (markedForReview[qId]) return 'bg-purple-100 border-purple-300 text-purple-800';
    if (selectedAnswers[qId]) return 'bg-emerald-100 border-emerald-300 text-emerald-800';
    if (visitedQuestions[qId]) return 'bg-red-50 border-red-200 text-red-600';
    return 'bg-gray-50 border-gray-200 text-gray-400';
  };

  const handleNext = () => {
    if (currentQ) {
      setVisitedQuestions((prev) => ({ ...prev, [currentQ.id]: true }));
    }
    if (currentQIndex < questionsList.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex((prev) => prev - 1);
    }
  };

  const selectAnswer = (ans: string) => {
    if (!currentQ) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: ans,
    }));
  };

  const clearAnswer = () => {
    if (!currentQ) return;
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const toggleMarkReview = () => {
    if (!currentQ) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  return (
    <div id="online-exam-fullscreen" className="fixed inset-0 z-50 bg-gray-950 flex flex-col font-sans text-gray-100 overflow-hidden select-none">
      {/* Header bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-amber-500" />
          <div>
            <h2 className="text-base font-bold text-gray-100">{test.title}</h2>
            <p className="text-xs text-gray-400 font-semibold">{test.testMode} • {test.totalMarks} Marks</p>
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex items-center gap-4 bg-gray-800 px-4 py-2 rounded-2xl border border-gray-700/50">
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="h-4.5 w-4.5 animate-pulse" />
            <span className="font-mono font-bold text-lg tracking-wider">
              {formatTime(timeLeft)}
            </span>
          </div>
          {!isFullscreen && (
            <button
              onClick={enterFullscreen}
              className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded hover:bg-amber-500 hover:text-white transition"
            >
              Fullscreen
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* Left Side: Question Pane */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto p-4 sm:p-8">
          {currentQ ? (
            <div className="max-w-3xl mx-auto w-full space-y-6">
              <div className="flex justify-between items-center bg-gray-900/50 px-4 py-2.5 rounded-xl border border-gray-800">
                <span className="text-sm font-semibold text-gray-400">
                  Question {currentQIndex + 1} of {questionsList.length}
                </span>
                <span className="text-xs font-bold text-primary-400 bg-primary-950/40 px-2.5 py-1 rounded-md">
                  {currentTQ.marks} Marks
                </span>
              </div>

              {/* Question Text */}
              <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                <p className="text-base leading-relaxed font-semibold text-gray-100">
                  {currentQ.questionText}
                </p>
              </div>

              {/* Options lists */}
              <div className="space-y-3">
                {Array.isArray(currentQ.options) ? (
                  (currentQ.options as string[]).map((opt: string, optIdx: number) => {
                    const alphabet = String.fromCharCode(65 + optIdx);
                    const isSelected = selectedAnswers[currentQ.id] === opt;
                    return (
                      <div
                        key={optIdx}
                        onClick={() => selectAnswer(opt)}
                        className={`p-4 border rounded-2xl cursor-pointer transition flex items-center gap-4 ${
                          isSelected
                             ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                             : 'border-gray-800 bg-gray-900/40 hover:bg-gray-900 text-gray-300 hover:text-white'
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border ${
                          isSelected ? 'bg-amber-500 border-amber-400 text-gray-950' : 'bg-gray-850 border-gray-700 text-gray-400'
                        }`}>
                          {alphabet}
                        </div>
                        <span className="text-sm">{opt}</span>
                      </div>
                    );
                  })
                ) : (
                  // Numerical Input Box
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Your Answer:</label>
                    <input
                      type="text"
                      placeholder="Type your answer here..."
                      value={selectedAnswers[currentQ.id] || ''}
                      onChange={(e) => selectAnswer(e.target.value)}
                      className="w-full max-w-sm px-4 py-3 bg-gray-900 border border-gray-800 rounded-2xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">No question available.</p>
            </div>
          )}

          {/* Action Footer */}
          <div className="border-t border-gray-850 pt-6 mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center max-w-4xl mx-auto w-full">
            <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={clearAnswer}
                className="px-4 py-2 border border-gray-800 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-900 transition"
              >
                Clear Response
              </button>
              <button
                onClick={toggleMarkReview}
                className="px-4 py-2 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-800 text-purple-300 rounded-xl text-xs font-bold transition"
              >
                {markedForReview[currentQ?.id || ''] ? 'Unmark Review' : 'Mark for Review'}
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentQIndex === 0}
                  className="p-2 border border-gray-800 hover:bg-gray-900 disabled:opacity-40 disabled:hover:bg-transparent rounded-xl transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentQIndex === questionsList.length - 1}
                  className="p-2 border border-gray-800 hover:bg-gray-900 disabled:opacity-40 disabled:hover:bg-transparent rounded-xl transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-xl text-xs shadow-sm transition"
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Sidebar Navigation Palette */}
        <div className="w-full lg:w-80 bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-800 flex flex-col justify-between p-4 sm:p-6 shrink-0">
          <div className="space-y-6">
            <h3 className="font-bold text-sm uppercase text-gray-400 tracking-wider">Exam Navigator</h3>

            {/* Questions list grid */}
            <div className="grid grid-cols-5 gap-2 max-h-[50vh] overflow-y-auto pr-1">
              {questionsList.map((tq: any, idx: number) => (
                <button
                  key={tq.questionId}
                  onClick={() => {
                    if (currentQ) setVisitedQuestions((prev) => ({ ...prev, [currentQ.id]: true }));
                    setCurrentQIndex(idx);
                  }}
                  className={`h-10 w-10 border rounded-lg text-xs font-semibold flex items-center justify-center transition ${getGridColor(
                    idx,
                    tq.questionId
                  )}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Legend guide */}
            <div className="border-t border-gray-850 pt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="h-3.5 w-3.5 bg-emerald-500/20 border border-emerald-500/50 rounded" />
                <span className="text-gray-400">Answered</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-3.5 w-3.5 bg-purple-500/20 border border-purple-500/50 rounded" />
                <span className="text-gray-400">Marked for Review</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-3.5 w-3.5 bg-red-500/20 border border-red-500/50 rounded" />
                <span className="text-gray-400">Unanswered</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-3.5 w-3.5 bg-gray-800 border border-gray-700 rounded" />
                <span className="text-gray-400">Not Visited</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSubmitConfirm(true)}
            disabled={submitAttemptMutation.isPending}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold rounded-xl text-xs shadow-sm transition uppercase tracking-wider"
          >
            {submitAttemptMutation.isPending ? 'Finalizing Paper...' : 'Submit Paper'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={() => {
          setShowSubmitConfirm(false);
          handleSubmitExam(true);
        }}
        title="Submit Exam"
        message="Are you sure you want to submit your exam? You cannot modify your answers after submitting."
        confirmLabel="Submit"
        isDestructive={false}
        isLoading={submitAttemptMutation.isPending}
      />
    </div>
  );
};
