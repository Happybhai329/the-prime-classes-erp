import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Brain,
  Award,
  TrendingUp,
  TrendingDown,
  ClipboardList,
  BookOpen,
  Download,
  RefreshCw,
  AlertTriangle,
  Flame,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  useStudentPrediction,
  useStudentRecommendations,
  useTriggerSync,
} from '@/hooks/useAnalytics';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export const PredictionDashboard: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  
  // For demonstration, let's fetch students if we need to selector, but assume route has studentId.
  // In a real flow, a Super Admin or Faculty visits /analytics/student/:studentId,
  // and a Student views their own from the menu /analytics.
  const { data: prediction, isLoading: predLoading, refetch } = useStudentPrediction(studentId || '');
  const { data: recommendations, isLoading: recLoading } = useStudentRecommendations(studentId || '');
  const syncMutation = useTriggerSync();

  const [activeTab, setActiveTab] = useState<'tests' | 'materials' | 'assignments'>('tests');

  const handleDownloadPdf = async () => {
    if (!studentId) return;
    try {
      toast.loading('Generating PDF Report...');
      const response = await api.get(`/analytics/student/${studentId}/report/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AI_Student_Report_${studentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success('Downloaded Report successfully!');
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to download PDF report.');
    }
  };

  const handleTriggerSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: () => refetch(),
    });
  };

  if (!studentId) {
    return (
      <div className="p-8 text-center card max-w-lg mx-auto mt-20">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Student ID Required</h2>
        <p className="text-gray-500 mt-2">Please select a student from the Student directory or Faculty dashboard to view detailed predictions.</p>
      </div>
    );
  }

  if (predLoading || recLoading) {
    return <LoadingSpinner size="lg" className="py-24" />;
  }

  const result = prediction?.data;
  const recData = recommendations?.data;

  if (!result) {
    return (
      <div className="p-8 text-center card max-w-lg mx-auto mt-20">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">No Analytics Found</h2>
        <p className="text-gray-500 mt-2">Ensure the student has attended sessions and taken mock tests, then trigger manual sync.</p>
        <button
          onClick={handleTriggerSync}
          disabled={syncMutation.isPending}
          className="btn btn-primary mt-4 inline-flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
          Run Analytics Sync
        </button>
      </div>
    );
  }

  // Determine category badge styles
  const categoryColors: Record<string, string> = {
    EXCELLENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    STRONG: 'bg-blue-50 text-blue-700 border-blue-200',
    MODERATE: 'bg-amber-50 text-amber-700 border-amber-200',
    AT_RISK: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="space-y-6 animate-slide-up" id="prediction-dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Student AI Analytics & Predictions"
          description="Explainable success probabilities and study recommendations based on performance indicators."
        />
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTriggerSync}
            disabled={syncMutation.isPending}
            className="btn btn-outline-primary inline-flex items-center gap-1.5"
            title="Refresh database snapshot data"
          >
            <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            Sync AI Engine
          </button>
          <button
            onClick={handleDownloadPdf}
            className="btn btn-primary inline-flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            PDF Report card
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Success Score Radial Indicator */}
        <div className="card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <h3 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-500" /> Overall Success Probability
          </h3>
          <div className="relative flex items-center justify-center w-40 h-40">
            {/* SVG circle meter */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                className="text-gray-100"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                className="text-primary-600 transition-all duration-1000"
                strokeWidth="12"
                strokeDasharray={439.8}
                strokeDashoffset={439.8 - (439.8 * result.successProbability) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-display font-bold text-gray-900">{result.successProbability}%</span>
              <span className="text-xs text-gray-400 font-medium mt-0.5">Success Index</span>
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center">
            <span className={`px-4 py-1.5 rounded-full border text-sm font-bold uppercase tracking-wider ${categoryColors[result.category]}`}>
              {result.category}
            </span>
            <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500">
              {result.rankTrend === 'UPWARD' ? (
                <>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold text-emerald-600">Improving Rank Trend</span>
                </>
              ) : result.rankTrend === 'DOWNWARD' ? (
                <>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="font-semibold text-red-500">Declining Rank Trend</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-slate-400" />
                  <span>Stable Rank Trend</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Target School Probabilities */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="h-5 w-5 text-accent-500" /> Exam Specific Probabilities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(result.predictedExams || {}).map(([exam, prob]: any) => (
              <div key={exam} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wide">
                      {exam === 'SAINIK' ? 'Sainik School Exam' : exam === 'RMS' ? 'RMS military school' : exam === 'RIMC' ? 'RIMC Dehradun' : 'Scholarship Test'}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">Based on syllabus coverage & difficulty weight</p>
                  </div>
                  <span className="text-xl font-display font-extrabold text-primary-600">{prob}%</span>
                </div>
                {/* Horizontal progress bar */}
                <div className="w-full bg-gray-200 h-2 rounded-full mt-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${prob >= 80 ? 'bg-emerald-500' : prob >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${prob}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explanations & Topic Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Explainability Log */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" /> Explainable Triggers
          </h3>
          <div className="space-y-4">
            {(result.explanations || []).map((exp: any, idx: number) => (
              <div key={idx} className="flex gap-3">
                <div className="mt-0.5">
                  {exp.impact === 'positive' ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px]">✔</span>
                  ) : exp.impact === 'negative' ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-50 text-red-700 border border-red-100 text-[10px]">!</span>
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-50 text-gray-700 border border-gray-100 text-[10px]">~</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wide">{exp.factor}</h4>
                  <p className="text-sm text-gray-600 mt-0.5">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak / Strong Topics */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary-600" /> Topic-Level Accuracies
          </h3>
          {recData?.weakTopics && recData.weakTopics.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...(recData.weakTopics || []), ...(recData.strongTopics || [])].slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="topic" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ borderRadius: 8 }} />
                  <Bar dataKey="accuracy" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Accuracy %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-20 border border-dashed rounded-xl">Insufficient mock response logs to analyze topic metrics.</p>
          )}
        </div>
      </div>

      {/* Personalized Recommendations Section */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600" /> Prescribed Revision & Study Recommendations
        </h3>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-5">
          <button
            onClick={() => setActiveTab('tests')}
            className={`pb-3 text-sm font-semibold border-b-2 px-4 ${activeTab === 'tests' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400'}`}
          >
            Recommended Mock Tests ({recData?.recommendedTests?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`pb-3 text-sm font-semibold border-b-2 px-4 ${activeTab === 'materials' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400'}`}
          >
            Study Materials ({recData?.studyMaterials?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`pb-3 text-sm font-semibold border-b-2 px-4 ${activeTab === 'assignments' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400'}`}
          >
            Revision Assignments ({recData?.revisionAssignments?.length || 0})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'tests' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recData?.recommendedTests?.map((test: any) => (
              <div key={test.id} className="border rounded-xl p-4 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{test.title}</p>
                  <p className="text-xs text-gray-500 mt-1">Subject: {test.subjectName} · Max Marks: {test.totalMarks}</p>
                </div>
                <button
                  onClick={() => toast.success(`Simulating Take Test: ${test.title}`)}
                  className="btn btn-sm btn-outline-primary"
                >
                  Start Test
                </button>
              </div>
            ))}
            {(!recData?.recommendedTests || recData.recommendedTests.length === 0) && (
              <p className="col-span-2 text-center text-gray-400 py-6 text-sm">No practice tests recommended.</p>
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recData?.studyMaterials?.map((mat: any) => (
              <div key={mat.id} className="border rounded-xl p-4 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{mat.title}</p>
                  <p className="text-xs text-gray-500 mt-1">Subject: {mat.subjectName} · Topic: {mat.topic}</p>
                </div>
                <a
                  href={mat.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-primary"
                >
                  Download File
                </a>
              </div>
            ))}
            {(!recData?.studyMaterials || recData.studyMaterials.length === 0) && (
              <p className="col-span-2 text-center text-gray-400 py-6 text-sm">No specific study guides prescribed.</p>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recData?.revisionAssignments?.map((a: any) => (
              <div key={a.id} className="border rounded-xl p-4 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-500 mt-1">Subject: {a.subjectName} · Due: {new Date(a.deadline).toLocaleDateString('en-IN')}</p>
                </div>
                <button
                  onClick={() => toast.success(`Viewing Assignment Details: ${a.title}`)}
                  className="btn btn-sm btn-outline-primary"
                >
                  View details
                </button>
              </div>
            ))}
            {(!recData?.revisionAssignments || recData.revisionAssignments.length === 0) && (
              <p className="col-span-2 text-center text-gray-400 py-6 text-sm">No pending assignments for revision.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default PredictionDashboard;
