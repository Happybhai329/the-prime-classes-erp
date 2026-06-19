import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useQuestions, useQuestionBanks, useQuestionBankDetails, useCreateQuestion, useDeleteQuestion, useBulkImportQuestions, useCreateQuestionBank } from '@/hooks/useQuestions';
import { useBatches } from '@/hooks/useBatches';
import { HelpCircle, Plus, Trash2, Database, FileJson, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { DifficultyLevel, QuestionType } from '@prime/shared-types';

export const QuestionBankPage: React.FC = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  
  const [isCreateBankOpen, setIsCreateBankOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  // Form states for creating bank
  const [bankName, setBankName] = useState('');
  const [bankDesc, setBankDesc] = useState('');
  const [bankSubjectId, setBankSubjectId] = useState('');

  // Form states for single question creation
  const [qSubjectId, setQSubjectId] = useState('');
  const [qTopic, setQTopic] = useState('');
  const [qDifficulty, setQDifficulty] = useState<DifficultyLevel>(DifficultyLevel.EASY);
  const [qMarks, setQMarks] = useState('2');
  const [qType, setQType] = useState<QuestionType>(QuestionType.MCQ);
  const [qText, setQText] = useState('');
  const [qOptionA, setQOptionA] = useState('');
  const [qOptionB, setQOptionB] = useState('');
  const [qOptionC, setQOptionC] = useState('');
  const [qOptionD, setQOptionD] = useState('');
  const [qCorrect, setQCorrect] = useState('');
  const [qExplanation, setQExplanation] = useState('');

  // Form states for JSON Bulk Import
  const [jsonPayload, setJsonPayload] = useState('');

  // Queries
  const { data: questionsData, isLoading: questionsLoading } = useQuestions(selectedSubjectId ? { subjectId: selectedSubjectId } : undefined);
  const { data: banksData, isLoading: banksLoading } = useQuestionBanks(selectedSubjectId || undefined);
  const { data: bankDetails, isLoading: bankDetailsLoading } = useQuestionBankDetails(selectedBankId || '');

  // We can extract all batches to fetch subjects
  const { data: batchesData } = useBatches({ limit: 100 });
  const batches = batchesData?.data || [];
  
  // Extract all unique subjects across batches
  const allSubjectsMap = new Map();
  batches.forEach((b: any) => {
    b.subjects?.forEach((s: any) => {
      allSubjectsMap.set(s.id, s);
    });
  });
  const subjects = Array.from(allSubjectsMap.values());

  // Mutations
  const createBankMutation = useCreateQuestionBank();
  const createQuestionMutation = useCreateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();
  const bulkImportMutation = useBulkImportQuestions();

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !bankSubjectId) {
      toast.error('Required fields are missing');
      return;
    }

    try {
      await createBankMutation.mutateAsync({
        name: bankName,
        description: bankDesc || undefined,
        subjectId: bankSubjectId,
      });
      toast.success('Question Bank created');
      setIsCreateBankOpen(false);
      setBankName('');
      setBankDesc('');
      setBankSubjectId('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Creation failed');
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qSubjectId || !qTopic || !qText || !qCorrect) {
      toast.error('Required fields are missing');
      return;
    }

    const options = qType === QuestionType.MCQ ? [qOptionA, qOptionB, qOptionC, qOptionD].filter(Boolean) : undefined;

    try {
      await createQuestionMutation.mutateAsync({
        subjectId: qSubjectId,
        topic: qTopic,
        difficulty: qDifficulty,
        marks: Number(qMarks),
        questionType: qType,
        questionText: qText,
        options,
        correctAnswer: qCorrect,
        explanation: qExplanation || undefined,
      });
      toast.success('Question added successfully');
      setIsAddQuestionOpen(false);
      resetQuestionForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add question');
    }
  };

  const resetQuestionForm = () => {
    setQSubjectId('');
    setQTopic('');
    setQDifficulty(DifficultyLevel.EASY);
    setQMarks('2');
    setQType(QuestionType.MCQ);
    setQText('');
    setQOptionA('');
    setQOptionB('');
    setQOptionC('');
    setQOptionD('');
    setQCorrect('');
    setQExplanation('');
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestionToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;
    try {
      await deleteQuestionMutation.mutateAsync(questionToDelete);
      toast.success('Question deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setIsDeleteDialogOpen(false);
      setQuestionToDelete(null);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonPayload);
      if (!Array.isArray(parsed)) {
        toast.error('JSON must be an array of questions');
        return;
      }

      await bulkImportMutation.mutateAsync(parsed);
      toast.success('Questions imported successfully!');
      setIsImportOpen(false);
      setJsonPayload('');
    } catch (err: any) {
      toast.error('Invalid JSON structure or import failed');
    }
  };



  const questions = questionsData?.data || [];
  const banks = banksData?.data || [];

  return (
    <div id="question-bank-page" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Question Banks Repository"
          description="Manage exam modules, categorize questions by topic, and batch import via JSON."
        />
        <div className="flex gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition"
          >
            <FileJson className="h-4 w-4" /> Bulk Import JSON
          </button>
          <button
            onClick={() => setIsCreateBankOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 transition shadow-sm"
          >
            <Plus className="h-4 w-4" /> Create Bank
          </button>
          <button
            onClick={() => setIsAddQuestionOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Question
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
        <label className="text-xs font-semibold text-gray-400 uppercase">Filter Subject:</label>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-xl focus:outline-none text-sm text-gray-600 bg-white"
        >
          <option value="">All Subjects</option>
          {subjects.map((sub: any) => (
            <option key={sub.id} value={sub.id}>{sub.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Banks List */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Database className="h-5 w-5 text-amber-500" /> Question Banks
            </h3>
            {banksLoading ? (
              <LoadingSpinner size="md" className="py-6" />
            ) : banks.length > 0 ? (
              <div className="space-y-2">
                {banks.map((bank: any) => (
                  <div
                    key={bank.id}
                    onClick={() => setSelectedBankId(bank.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                      selectedBankId === bank.id ? 'border-primary-500 bg-primary-50/20' : 'border-gray-100 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900 text-xs">{bank.name}</h4>
                      <p className="text-[10px] text-gray-400">Subject: {bank.subject?.name}</p>
                    </div>
                    <span className="text-[10px] bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded">
                      {bank.questionBankQuestions?.length || 0} Qs
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">No question banks found.</p>
            )}
          </div>
        </div>

        {/* Right Column: Bank details or global questions pool */}
        <div className="lg:col-span-2 space-y-4">
          {selectedBankId ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{bankDetails?.name}</h3>
                  <p className="text-xs text-gray-400">{bankDetails?.description || 'No description provided.'}</p>
                </div>
                <button
                  onClick={() => setSelectedBankId(null)}
                  className="text-xs text-gray-400 hover:text-gray-900 border border-gray-200 px-2 py-1 rounded"
                >
                  Show All Pool
                </button>
              </div>

              {bankDetailsLoading ? (
                <LoadingSpinner size="md" className="py-8" />
              ) : (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Linked Questions</h4>
                  {bankDetails?.questionBankQuestions?.map((bq: any) => (
                    <div key={bq.questionId} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-start gap-4 text-xs">
                      <div>
                        <p className="font-semibold text-gray-800">{bq.question.questionText}</p>
                        <p className="text-[10px] text-gray-400 mt-1">Topic: {bq.question.topic} • Difficulty: {bq.question.difficulty}</p>
                      </div>
                      <span className="font-bold text-gray-500 shrink-0">{bq.question.marks} M</span>
                    </div>
                  ))}
                  {(!bankDetails?.questionBankQuestions || bankDetails.questionBankQuestions.length === 0) && (
                    <p className="text-xs text-gray-400 text-center py-4">No questions linked. Add questions from pool to this bank.</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Global Questions Pool
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary-500" /> Questions Pool
              </h3>
              {questionsLoading ? (
                <LoadingSpinner size="md" className="py-8" />
              ) : questions.length > 0 ? (
                <div className="space-y-3">
                  {questions.map((q: any) => (
                    <div key={q.id} className="p-3.5 border border-gray-100 bg-white hover:bg-gray-50/50 rounded-xl flex justify-between items-start gap-4 text-xs group transition">
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900">{q.questionText}</p>
                        <div className="flex flex-wrap gap-2 text-[10px] text-gray-400 font-medium pt-1">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{q.subject?.name}</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Topic: {q.topic}</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Type: {q.questionType}</span>
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            q.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-600' :
                            q.difficulty === 'MEDIUM' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                          }`}>{q.difficulty}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-gray-600">{q.marks} Marks</span>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition"
                          title="Delete from pool"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No questions found" description="Create questions or select another subject filter." />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Bank Modal */}
      {isCreateBankOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Question Bank</h3>
            <form onSubmit={handleCreateBank} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Bank Name *</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Description</label>
                <textarea
                  value={bankDesc}
                  onChange={(e) => setBankDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Subject *</label>
                <select
                  value={bankSubjectId}
                  required
                  onChange={(e) => setBankSubjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateBankOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createBankMutation.isPending}
                  className="px-4 py-2 rounded-lg text-sm text-white bg-amber-500 hover:bg-amber-600 transition"
                >
                  {createBankMutation.isPending ? 'Creating...' : 'Create Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {isAddQuestionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Question to Pool</h3>
            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Subject *</label>
                  <select
                    value={qSubjectId}
                    required
                    onChange={(e) => setQSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Topic / Chapter *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Percentage"
                    value={qTopic}
                    onChange={(e) => setQTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Difficulty *</label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  >
                    {Object.values(DifficultyLevel).map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Marks Weight *</label>
                  <input
                    type="number"
                    required
                    value={qMarks}
                    onChange={(e) => setQMarks(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Question Type *</label>
                  <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value as QuestionType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  >
                    {Object.values(QuestionType).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Correct Answer *</label>
                  <input
                    type="text"
                    required
                    placeholder="MCQ: Option content exactly, or Numerical value"
                    value={qCorrect}
                    onChange={(e) => setQCorrect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Question Text *</label>
                <textarea
                  required
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  rows={3}
                />
              </div>

              {qType === QuestionType.MCQ && (
                <div className="border border-gray-100 p-4 rounded-xl space-y-3 bg-gray-50/50">
                  <h4 className="text-xs font-bold text-gray-700 uppercase">MCQ Options</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Option A *"
                      required
                      value={qOptionA}
                      onChange={(e) => setQOptionA(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Option B *"
                      required
                      value={qOptionB}
                      onChange={(e) => setQOptionB(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Option C"
                      value={qOptionC}
                      onChange={(e) => setQOptionC(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Option D"
                      value={qOptionD}
                      onChange={(e) => setQOptionD(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Explanation / Solution Hint</label>
                <textarea
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddQuestionOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createQuestionMutation.isPending}
                  className="px-4 py-2 rounded-lg text-sm text-white bg-primary-600 hover:bg-primary-700 transition"
                >
                  {createQuestionMutation.isPending ? 'Saving...' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JSON Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Bulk JSON Importer</h3>
            <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Paste a valid JSON array matching the question schema structure.</span>
            </p>
            <form onSubmit={handleBulkImport} className="space-y-4">
              <div>
                <textarea
                  required
                  placeholder='[\n  {\n    "subjectId": "uuid-here",\n    "topic": "Algebra",\n    "difficulty": "EASY",\n    "marks": 2,\n    "questionType": "MCQ",\n    "questionText": "What is x when 2x = 4?",\n    "options": ["1", "2", "3", "4"],\n    "correctAnswer": "2"\n  }\n]'
                  value={jsonPayload}
                  onChange={(e) => setJsonPayload(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  rows={12}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsImportOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkImportMutation.isPending}
                  className="px-4 py-2 rounded-lg text-sm text-white bg-primary-600 hover:bg-primary-700 transition"
                >
                  {bulkImportMutation.isPending ? 'Importing...' : 'Validate & Import'}
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
          setQuestionToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Question"
        message="Are you sure you want to delete this question from pool?"
        confirmLabel="Delete"
        isDestructive={true}
        isLoading={deleteQuestionMutation.isPending}
      />
    </div>
  );
};
