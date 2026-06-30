import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/store/auth.store';
import { useAssignments, useAssignmentDetails, useCreateAssignment, useDeleteAssignment, useSubmitAssignment, useGradeAssignment } from '@/hooks/useAssignments';
import { useBatches, useBatch } from '@/hooks/useBatches';
import { BookOpen, Plus, Calendar, FileText, Upload, Award, CheckCircle, Clock, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export const HomeworkPage: React.FC = () => {
  const { user } = useAuthStore();
  const isStudent = user?.role === 'STUDENT';
  const isAdminOrFaculty = ['ADMIN', 'SUPER_ADMIN', 'FACULTY'].includes(user?.role || '');

  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [_isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isGradingOpen, setIsGradingOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [homeworkToDelete, setHomeworkToDelete] = useState<string | null>(null);

  // Form states for Create Homework
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [createBatchId, setCreateBatchId] = useState('');
  const [createSubjectId, setCreateSubjectId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(true);

  // Form states for Student Submission
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);

  // Form states for Teacher Grading
  const [gradingStudentId, setGradingStudentId] = useState('');
  const [gradingStudentName, setGradingStudentName] = useState('');
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  // Queries (filtered by type: 'HOMEWORK')
  const { data: homeworkData, isLoading: homeworkLoading } = useAssignments({
    type: 'HOMEWORK',
    ...(isStudent ? {} : (selectedBatchId ? { batchId: selectedBatchId } : {})),
  });

  const { data: batchesData } = useBatches({ limit: 100 });
  const batches = batchesData?.data || [];

  // Get subjects of the batch selected in creation
  const { data: createBatchDetails } = useBatch(createBatchId);
  const batchSubjects = createBatchDetails?.subjects || [];

  // Get details of selected homework (submissions list)
  const { data: homeworkDetails, isLoading: detailsLoading } = useAssignmentDetails(selectedHomeworkId || '');

  // Mutations
  const createHomeworkMutation = useCreateAssignment();
  const deleteHomeworkMutation = useDeleteAssignment();
  const submitHomeworkMutation = useSubmitAssignment();
  const gradeHomeworkMutation = useGradeAssignment();

  // Selected homework from list for student actions
  const selectedHomework = homeworkData?.data?.data?.find((a: any) => a.id === selectedHomeworkId);

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !createBatchId || !createSubjectId || !deadline) {
      toast.error('Required fields are missing');
      return;
    }

    try {
      await createHomeworkMutation.mutateAsync({
        title,
        description,
        batchId: createBatchId,
        subjectId: createSubjectId,
        deadline: new Date(deadline).toISOString(),
        file: attachmentFile || undefined,
        type: 'HOMEWORK',
        isPublished,
      });
      toast.success('Homework created successfully');
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setCreateBatchId('');
      setCreateSubjectId('');
      setDeadline('');
      setAttachmentFile(null);
      setIsPublished(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Creation failed');
    }
  };

  const _handleDeleteHomework = (id: string) => {
    setHomeworkToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!homeworkToDelete) return;
    try {
      await deleteHomeworkMutation.mutateAsync(homeworkToDelete);
      toast.success('Homework deleted');
      if (selectedHomeworkId === homeworkToDelete) setSelectedHomeworkId(null);
    } catch {
      toast.error('Deletion failed');
    } finally {
      setIsDeleteDialogOpen(false);
      setHomeworkToDelete(null);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHomeworkId || !submissionFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      await submitHomeworkMutation.mutateAsync({
        id: selectedHomeworkId,
        file: submissionFile,
      });
      toast.success('Homework submitted successfully!');
      setIsSubmitOpen(false);
      setSubmissionFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHomeworkId || !gradingStudentId || !score) {
      toast.error('Score is required');
      return;
    }

    try {
      await gradeHomeworkMutation.mutateAsync({
        id: selectedHomeworkId,
        studentId: gradingStudentId,
        score: Number(score),
        feedback,
      });
      toast.success('Grade saved successfully');
      setIsGradingOpen(false);
      setGradingStudentId('');
      setScore('');
      setFeedback('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Grading failed');
    }
  };

  const openGradingModal = (studentId: string, name: string, currentScore?: number, currentFeedback?: string) => {
    setGradingStudentId(studentId);
    setGradingStudentName(name);
    setScore(currentScore ? String(currentScore) : '');
    setFeedback(currentFeedback || '');
    setIsGradingOpen(true);
  };

  if (homeworkLoading) return <LoadingSpinner size="lg" className="py-20" />;

  const homeworks = homeworkData?.data?.data || [];

  return (
    <div id="homework-page" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Homework Portal"
          description={isStudent ? "Track deadlines and submit homework." : "Create homework, track submissions and grade students."}
        />
        {isAdminOrFaculty && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 transition shadow-sm self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Create Homework
          </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Homework List */}
        <div className={`lg:col-span-${selectedHomeworkId ? '1' : '3'} space-y-4`}>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-500" /> Active Homework
            </h3>
            {homeworks.length > 0 ? (
              <div className="space-y-3">
                {homeworks.map((hw: any) => {
                  const isSelected = hw.id === selectedHomeworkId;
                  const isStudentSub = isStudent && hw.submissions?.some((s: any) => s.studentId === user?.student?.id);
                  const subData = isStudent ? hw.submissions?.find((s: any) => s.studentId === user?.student?.id) : null;

                  // Deadline color coding
                  const dueDate = new Date(hw.deadline);
                  const today = new Date();
                  const isOverdue = dueDate < today && !isStudentSub;
                  const isDueSoon = dueDate.getTime() - today.getTime() < 24 * 60 * 60 * 1000 && !isOverdue && !isStudentSub;

                  let dateBadgeColor = "text-gray-500 bg-gray-50";
                  if (isOverdue) dateBadgeColor = "text-red-600 bg-red-50";
                  else if (isDueSoon) dateBadgeColor = "text-yellow-600 bg-yellow-50";

                  return (
                    <div
                      key={hw.id}
                      onClick={() => setSelectedHomeworkId(hw.id)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex justify-between items-start gap-4 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50/30'
                          : 'border-gray-100 bg-white hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{hw.title}</h4>
                        <p className="text-xs text-gray-400">Subject: {hw.subject?.name}</p>
                        {!isStudent && <p className="text-xs text-gray-400">Batch: {hw.batch?.name}</p>}
                        <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full w-fit mt-2 ${dateBadgeColor}`}>
                          <Calendar className="h-3 w-3" />
                          <span>Due {dueDate.toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {isStudent ? (
                          isStudentSub ? (
                            subData?.status === 'REVIEWED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                                <Award className="h-3.5 w-3.5" /> Graded ({subData.score} pts)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                <CheckCircle className="h-3.5 w-3.5" /> Submitted
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                              <Clock className="h-3.5 w-3.5" /> Pending
                            </span>
                          )
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {!hw.isPublished && (
                              <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">Draft</span>
                            )}
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                              {hw.submissions?.length || 0} Submissions
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">No homework assigned.</p>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedHomeworkId && selectedHomework && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative space-y-4">
              <div className="absolute top-4 right-4 flex items-center gap-3">
                {isAdminOrFaculty && (
                  <button
                    onClick={() => _handleDeleteHomework(selectedHomework.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => setSelectedHomeworkId(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
                >
                  Close
                </button>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">{selectedHomework.subject?.name}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{selectedHomework.title}</h3>
                <p className="text-xs text-gray-400 mt-1">Assigned on: {new Date(selectedHomework.createdAt).toLocaleDateString()}</p>
              </div>

              {selectedHomework.description && (
                <div className="bg-gray-50/50 p-4 rounded-xl text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                  {selectedHomework.description}
                </div>
              )}

              {selectedHomework.fileUrl && (
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/30">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600 truncate max-w-xs sm:max-w-md">Attachment Worksheet</span>
                  </div>
                  {selectedHomework.attachmentPresignedUrl ? (
                    <a
                      href={selectedHomework.attachmentPresignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-primary-600 bg-primary-50 hover:bg-primary-100 transition"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Presigned URL expired</span>
                  )}
                </div>
              )}

              {/* Student Submit Form */}
              {isStudent && (
                <div className="border-t border-gray-100 pt-4">
                  {selectedHomework.submissionStatus === 'Pending' || selectedHomework.submissionStatus === 'Late' ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                        <Upload className="h-4 w-4 text-primary-500" /> Submit Homework Sheet
                      </h4>
                      <form onSubmit={handleStudentSubmit} className="space-y-3">
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer relative">
                          <input
                            type="file"
                            onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            required
                          />
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500 font-medium">
                            {submissionFile ? submissionFile.name : "Select or drag file here"}
                          </span>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
                        >
                          Submit Work
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-emerald-800">Your Submission Details</span>
                        <span className="text-xs font-bold text-emerald-600">Submitted</span>
                      </div>
                      <p className="text-xs text-emerald-700">
                        Submitted at: {new Date(selectedHomework.submissionDetails?.submittedAt).toLocaleString()}
                      </p>
                      {selectedHomework.submissionDetails?.score !== null && (
                        <div className="bg-white p-3 rounded-lg border border-emerald-100 flex justify-between items-center shadow-xs">
                          <div>
                            <p className="text-xs text-gray-400">Score Awarded</p>
                            <p className="text-lg font-bold text-gray-900">{selectedHomework.submissionDetails?.score} / 100</p>
                          </div>
                          {selectedHomework.submissionDetails?.feedback && (
                            <div className="text-right max-w-xs">
                              <p className="text-[10px] text-gray-400">Remarks</p>
                              <p className="text-xs text-gray-600 italic">"{selectedHomework.submissionDetails?.feedback}"</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Faculty Submissions Review */}
              {isAdminOrFaculty && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <h4 className="font-semibold text-gray-900 text-sm">Review Student Submissions</h4>
                  {detailsLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {homeworkDetails?.submissions?.length > 0 ? (
                        homeworkDetails.submissions.map((sub: any) => (
                          <div key={sub.id} className="p-3 border border-gray-100 rounded-xl flex items-center justify-between gap-4 hover:bg-gray-50/30 transition">
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-gray-900">
                                {sub.student?.firstName} {sub.student?.lastName}
                              </p>
                              <p className="text-[10px] text-gray-400">Roll No: {sub.student?.rollNumber}</p>
                              <p className="text-[10px] text-gray-400">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                              {sub.status === 'LATE' && <span className="inline-block text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full mt-1">Late Submission</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              {sub.fileUrl && (
                                <a
                                  href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/storage/presigned?key=${sub.fileUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 bg-white"
                                  title="Download Homework"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              )}
                              {sub.score !== null ? (
                                <div className="text-right">
                                  <span className="text-xs font-bold text-emerald-600 block">{sub.score} / 100</span>
                                  <button
                                    onClick={() => openGradingModal(sub.studentId, `${sub.student?.firstName} ${sub.student?.lastName}`, sub.score, sub.feedback)}
                                    className="text-[10px] text-primary-600 hover:underline"
                                  >
                                    Edit Grade
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => openGradingModal(sub.studentId, `${sub.student?.firstName} ${sub.student?.lastName}`)}
                                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition"
                                >
                                  Grade
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-4">No submissions received yet.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Homework Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-500" /> Assign Homework
            </h3>
            <form onSubmit={handleCreateHomework} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Homework Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 text-sm"
                  placeholder="e.g. Maths Trigonometry Sheet"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Instructions / Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 text-sm h-24 resize-none"
                  placeholder="Add detailed homework instructions..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Target Batch</label>
                  <select
                    value={createBatchId}
                    onChange={(e) => setCreateBatchId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 text-sm bg-white"
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Subject</label>
                  <select
                    value={createSubjectId}
                    onChange={(e) => setCreateSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 text-sm bg-white"
                    disabled={!createBatchId}
                    required
                  >
                    <option value="">Select Subject</option>
                    {batchSubjects.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Due Date & Time</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Attach Reference File</label>
                <input
                  type="file"
                  onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="publish-toggle"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="publish-toggle" className="text-xs font-semibold text-gray-600">
                  Publish Immediately (notify students)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-amber-500 hover:bg-amber-600 transition"
                >
                  Publish Homework
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {isGradingOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full border border-gray-100 space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Grade Student Homework</h3>
              <p className="text-xs text-gray-400 mt-0.5">Student: {gradingStudentName}</p>
            </div>
            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Score (out of 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 text-sm"
                  placeholder="e.g. 85"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Remarks / Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 text-sm h-20 resize-none"
                  placeholder="Well done, correct answers!"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGradingOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition"
                >
                  Submit Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Homework Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Homework"
        message="Are you sure you want to delete this homework? This will remove all student submissions permanently."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDeleteDialogOpen(false)}
        isDestructive
      />
    </div>
  );
};
