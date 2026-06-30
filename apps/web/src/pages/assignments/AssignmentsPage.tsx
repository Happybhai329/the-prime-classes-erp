import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/store/auth.store';
import { useAssignments, useAssignmentDetails, useCreateAssignment, useDeleteAssignment, useSubmitAssignment, useGradeAssignment } from '@/hooks/useAssignments';
import { useBatches, useBatch } from '@/hooks/useBatches';
import { ClipboardList, Plus, Trash2, Calendar, FileText, Upload, Award, CheckCircle, Clock, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuthStore();
  const isStudent = user?.role === 'STUDENT';
  const isAdminOrFaculty = ['ADMIN', 'SUPER_ADMIN', 'FACULTY'].includes(user?.role || '');

  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isGradingOpen, setIsGradingOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);

  // Form states for Create Assignment
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [createBatchId, setCreateBatchId] = useState('');
  const [createSubjectId, setCreateSubjectId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  // Form states for Student Submission
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);

  // Form states for Teacher Grading
  const [gradingStudentId, setGradingStudentId] = useState('');
  const [gradingStudentName, setGradingStudentName] = useState('');
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  // Queries
  const { data: assignmentsData, isLoading: assignmentsLoading } = useAssignments(
    isStudent ? undefined : (selectedBatchId ? { batchId: selectedBatchId } : undefined)
  );

  const { data: batchesData } = useBatches({ limit: 100 });
  const batches = batchesData?.data || [];

  // Get subjects of the batch selected in creation
  const { data: createBatchDetails } = useBatch(createBatchId);
  const batchSubjects = createBatchDetails?.subjects || [];

  // Get details of selected assignment (submissions list)
  const { data: assignmentDetails, isLoading: detailsLoading } = useAssignmentDetails(selectedAssignmentId || '');

  // Mutations
  const createAssignmentMutation = useCreateAssignment();
  const deleteAssignmentMutation = useDeleteAssignment();
  const submitAssignmentMutation = useSubmitAssignment();
  const gradeAssignmentMutation = useGradeAssignment();

  // Selected assignment from list for student actions
  const selectedAssignment = assignmentsData?.data?.data?.find((a: any) => a.id === selectedAssignmentId);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !createBatchId || !createSubjectId || !deadline) {
      toast.error('Required fields are missing');
      return;
    }

    try {
      await createAssignmentMutation.mutateAsync({
        title,
        description,
        batchId: createBatchId,
        subjectId: createSubjectId,
        deadline: new Date(deadline).toISOString(),
        file: attachmentFile || undefined,
      });
      toast.success('Assignment created successfully');
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setCreateBatchId('');
      setCreateSubjectId('');
      setDeadline('');
      setAttachmentFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Creation failed');
    }
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignmentToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!assignmentToDelete) return;
    try {
      await deleteAssignmentMutation.mutateAsync(assignmentToDelete);
      toast.success('Assignment deleted');
      if (selectedAssignmentId === assignmentToDelete) setSelectedAssignmentId(null);
    } catch {
      toast.error('Deletion failed');
    } finally {
      setIsDeleteDialogOpen(false);
      setAssignmentToDelete(null);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentId || !submissionFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      await submitAssignmentMutation.mutateAsync({
        id: selectedAssignmentId,
        file: submissionFile,
      });
      toast.success('Assignment submitted successfully!');
      setIsSubmitOpen(false);
      setSubmissionFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentId || !gradingStudentId || !score) {
      toast.error('Score is required');
      return;
    }

    try {
      await gradeAssignmentMutation.mutateAsync({
        id: selectedAssignmentId,
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

  if (assignmentsLoading) return <LoadingSpinner size="lg" className="py-20" />;

  const assignments = assignmentsData?.data?.data || [];

  return (
    <div id="assignments-page" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Assignments Portal"
          description={isStudent ? "Track deadlines and submit homework." : "Create assignments, track submissions and grade students."}
        />
        {isAdminOrFaculty && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 transition shadow-sm self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Create Assignment
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
        {/* Assignments List */}
        <div className={`lg:col-span-${selectedAssignmentId ? '1' : '3'} space-y-4`}>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-amber-500" /> Active Assignments
            </h3>
            {assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.map((asg: any) => {
                  const isSelected = asg.id === selectedAssignmentId;
                  const isStudentSub = isStudent && asg.submissions?.some((s: any) => s.studentId === user?.student?.id);
                  const subData = isStudent ? asg.submissions?.find((s: any) => s.studentId === user?.student?.id) : null;

                  return (
                    <div
                      key={asg.id}
                      onClick={() => setSelectedAssignmentId(asg.id)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex justify-between items-start gap-4 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50/30'
                          : 'border-gray-100 bg-white hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{asg.title}</h4>
                        <p className="text-xs text-gray-400">Subject: {asg.subject?.name}</p>
                        {!isStudent && <p className="text-xs text-gray-400">Batch: {asg.batch?.name}</p>}
                        <div className="flex items-center gap-1.5 text-xs text-red-500 pt-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Due {new Date(asg.deadline).toLocaleDateString()}</span>
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
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                              {asg.submissions?.length || 0} Submissions
                            </span>
                            {isAdminOrFaculty && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAssignment(asg.id);
                                }}
                                className="p-1 hover:text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">No assignments scheduled.</p>
            )}
          </div>
        </div>

        {/* Selected Assignment Details Panel */}
        {selectedAssignmentId && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-gray-50 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedAssignment?.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Subject: {selectedAssignment?.subject?.name} • Due: {new Date(selectedAssignment?.deadline).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAssignmentId(null)}
                  className="text-xs text-gray-400 hover:text-gray-900 border border-gray-200 px-2.5 py-1 rounded-lg"
                >
                  Close Panel
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50/50 p-4 rounded-xl">
                    {selectedAssignment?.description || 'No instructions provided.'}
                  </p>
                </div>

                {selectedAssignment?.fileUrl && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Attachment</h4>
                    <a
                      href={selectedAssignment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      <FileText className="h-4.5 w-4.5 text-primary-500" /> View Attachment
                    </a>
                  </div>
                )}

                {isStudent && (
                  <div className="pt-4 border-t border-gray-50">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Your Submission</h4>
                    {(() => {
                      const submission = selectedAssignment?.submissions?.find((s: any) => s.studentId === user?.student?.id);
                      if (submission) {
                        return (
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Submitted at {new Date(submission.submittedAt).toLocaleString()}</span>
                              {submission.status === 'REVIEWED' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                  Graded
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                  Pending Review
                                </span>
                              )}
                            </div>
                            {submission.fileUrl && (
                              <a
                                href={submission.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:underline"
                              >
                                <FileText className="h-4 w-4" /> Download Submitted Work
                              </a>
                            )}
                            {submission.status === 'REVIEWED' && (
                              <div className="pt-2 border-t border-gray-200/50 space-y-1">
                                <p className="text-sm font-bold text-gray-800">Score: {submission.score} / 100</p>
                                {submission.feedback && (
                                  <p className="text-xs text-gray-500">Feedback: {submission.feedback}</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <button
                            onClick={() => setIsSubmitOpen(true)}
                            className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 hover:border-primary-500 rounded-2xl text-sm font-semibold text-gray-500 hover:text-primary-600 transition"
                          >
                            <Upload className="h-5 w-5" /> Upload & Submit Assignment
                          </button>
                        );
                      }
                    })()}
                  </div>
                )}

                {isAdminOrFaculty && (
                  <div className="pt-4 border-t border-gray-50 space-y-4">
                    <h4 className="text-sm font-bold text-gray-900">Batch Submissions & Grading</h4>
                    {detailsLoading ? (
                      <LoadingSpinner size="md" className="py-6" />
                    ) : (
                      <div className="overflow-x-auto border border-gray-100 rounded-xl">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                              <th className="px-4 py-3">Student Name</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Attachment</th>
                              <th className="px-4 py-3">Score</th>
                              <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {assignmentDetails?.submissions?.map((sub: any) => (
                              <tr key={sub.id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-gray-900">{sub.student.firstName} {sub.student.lastName}</p>
                                  <p className="text-xs text-gray-400">Roll: {sub.student.rollNumber}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                                    sub.status === 'REVIEWED' ? 'bg-emerald-50 text-emerald-700' :
                                    sub.status === 'LATE' ? 'bg-red-50 text-red-700' :
                                    'bg-blue-50 text-blue-700'
                                  }`}>
                                    {sub.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {sub.fileUrl ? (
                                    <a
                                      href={sub.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-primary-600 font-semibold hover:underline"
                                    >
                                      <Download className="h-3.5 w-3.5" /> File
                                    </a>
                                  ) : (
                                    <span className="text-gray-400 text-xs">None</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 font-semibold">
                                  {sub.score !== null ? `${sub.score} pts` : '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() => openGradingModal(sub.studentId, `${sub.student.firstName} ${sub.student.lastName}`, sub.score, sub.feedback)}
                                    className="text-xs font-bold text-amber-500 hover:text-amber-600 transition"
                                  >
                                    {sub.score !== null ? 'Re-grade' : 'Grade'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {(!assignmentDetails?.submissions || assignmentDetails.submissions.length === 0) && (
                              <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-400">
                                  No submissions yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
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
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Instructions / Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Target Batch *</label>
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
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Submission Deadline *</label>
                <input
                  type="datetime-local"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Reference Material (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                />
              </div>
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
                  disabled={createAssignmentMutation.isPending}
                  className="px-4 py-2 rounded-lg text-sm text-white bg-amber-500 hover:bg-amber-600 transition"
                >
                  {createAssignmentMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Submit Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Assignment Work</h3>
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Upload PDF or Document File *</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitAssignmentMutation.isPending}
                  className="px-4 py-2 rounded-lg text-sm text-white bg-primary-600 hover:bg-primary-700 transition"
                >
                  {submitAssignmentMutation.isPending ? 'Uploading...' : 'Submit Work'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Grading Modal */}
      {isGradingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Evaluate Submission</h3>
            <p className="text-xs text-gray-400 mb-4">Grading student: <strong className="text-gray-700">{gradingStudentName}</strong></p>
            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Score (out of 100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Feedback Comments</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide guidance or feedback..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsGradingOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={gradeAssignmentMutation.isPending}
                  className="px-4 py-2 rounded-lg text-sm text-white bg-amber-500 hover:bg-amber-600 transition"
                >
                  {gradeAssignmentMutation.isPending ? 'Saving...' : 'Save Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setAssignmentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This will permanently delete the assignment and all associated student submissions."
        confirmLabel="Delete"
        isDestructive={true}
        isLoading={deleteAssignmentMutation.isPending}
      />
    </div>
  );
};
