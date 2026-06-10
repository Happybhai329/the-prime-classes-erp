import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Users, Layers, CalendarCheck, ClipboardList, IndianRupee } from 'lucide-react';
import { useStudent, useStudentAttendance, useStudentTests, useStudentFees } from '@/hooks/useStudents';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TabGroup } from '@/components/ui/TabGroup';


const tabs = [
  { id: 'personal', label: 'Personal', icon: <User className="h-4 w-4" /> },
  { id: 'parents', label: 'Parents', icon: <Users className="h-4 w-4" /> },
  { id: 'batches', label: 'Batches', icon: <Layers className="h-4 w-4" /> },
  { id: 'attendance', label: 'Attendance', icon: <CalendarCheck className="h-4 w-4" /> },
  { id: 'tests', label: 'Tests', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'fees', label: 'Fees', icon: <IndianRupee className="h-4 w-4" /> },
];

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');

  const { data: student, isLoading } = useStudent(id!);
  const { data: attendance } = useStudentAttendance(activeTab === 'attendance' ? id! : '');
  const { data: tests } = useStudentTests(activeTab === 'tests' ? id! : '');
  const { data: fees } = useStudentFees(activeTab === 'fees' ? id! : '');

  if (isLoading) return <LoadingSpinner size="lg" className="h-96" />;
  if (!student) return null;

  return (
    <div id="student-detail-page">
      <button onClick={() => navigate('/students')} className="btn-ghost mb-4 gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Students
      </button>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-white text-xl font-bold flex-shrink-0">
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-display font-bold text-gray-900">
                {student.firstName} {student.lastName}
              </h1>
              <StatusBadge status={student.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {student.rollNumber} · {student.classStudying} · {student.user?.email}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {student.targetExam?.map((exam: string) => (
                <span key={exam} className="badge-primary text-xs">{exam}</span>
              ))}
            </div>
          </div>
          <button onClick={() => navigate(`/students/${id}/edit`)} className="btn-primary">
            Edit Student
          </button>
        </div>
      </div>

      {/* Tabs */}
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === 'personal' && (
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Personal Information</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                ['Date of Birth', new Date(student.dob).toLocaleDateString('en-IN')],
                ['Gender', student.gender],
                ['School', student.schoolName],
                ['Class', student.classStudying],
                ['Admission Date', new Date(student.admissionDate).toLocaleDateString('en-IN')],
                ['Phone', student.user?.phone || '—'],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <dt className="text-xs text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-gray-900 mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>
            {student.address && typeof student.address === 'object' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs text-gray-500 mb-1">Address</h4>
                <p className="text-sm text-gray-900">
                  {(student.address as any).street}, {(student.address as any).city},{' '}
                  {(student.address as any).state} — {(student.address as any).pincode}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'parents' && (
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Parent / Guardian</h3>
            {student.parentMappings?.length > 0 ? (
              <div className="space-y-4">
                {student.parentMappings.map((pm: any) => (
                  <div key={pm.parent.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{pm.parent.fatherName}</p>
                      <p className="text-sm text-gray-500">
                        {pm.parent.fatherPhone} · {pm.relationship}
                      </p>
                    </div>
                    <button onClick={() => navigate(`/parents/${pm.parent.id}`)} className="btn-ghost btn-sm">
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No parents linked</p>
            )}
          </div>
        )}

        {activeTab === 'batches' && (
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Batch Enrollments</h3>
            {student.batchEnrollments?.length > 0 ? (
              <div className="space-y-3">
                {student.batchEnrollments.map((be: any) => (
                  <div key={be.batch.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{be.batch.name}</p>
                      <p className="text-xs text-gray-500">{be.batch.code} · {be.batch.academicYear}</p>
                    </div>
                    <StatusBadge status={be.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Not enrolled in any batch</p>
            )}
          </div>
        )}

        {activeTab === 'attendance' && attendance && (
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Attendance Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                ['Total Days', attendance.totalDays, 'text-gray-900'],
                ['Present', attendance.present, 'text-emerald-600'],
                ['Absent', attendance.absent, 'text-red-600'],
                ['Late', attendance.late, 'text-amber-600'],
                ['Leave', attendance.leave, 'text-purple-600'],
                ['Percentage', `${attendance.percentage}%`, attendance.percentage >= 75 ? 'text-emerald-600' : 'text-red-600'],
              ].map(([label, value, color]) => (
                <div key={label as string} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tests' && tests && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Test Performance</h3>
            </div>
            <table className="table">
              <thead><tr>
                <th>Test</th><th>Date</th><th>Marks</th><th>%</th><th>Rank</th><th>Grade</th>
              </tr></thead>
              <tbody>
                {tests.map((t: any) => (
                  <tr key={t.testId}>
                    <td className="font-medium">{t.testName}</td>
                    <td className="text-sm text-gray-500">{new Date(t.testDate).toLocaleDateString('en-IN')}</td>
                    <td>{t.isAbsent ? 'Absent' : `${t.marksObtained}/${t.totalMarks}`}</td>
                    <td>{t.percentage}%</td>
                    <td>{t.batchRank || '—'}</td>
                    <td><span className="badge-primary">{t.grade || '—'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'fees' && fees && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                ['Total Due', `₹${fees.totalDue}`, 'text-gray-900'],
                ['Total Paid', `₹${fees.totalPaid}`, 'text-emerald-600'],
                ['Balance', `₹${fees.balance}`, fees.balance > 0 ? 'text-red-600' : 'text-emerald-600'],
              ].map(([label, value, color]) => (
                <div key={label as string} className="card p-4 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
            <div className="card overflow-hidden">
              <table className="table">
                <thead><tr>
                  <th>Invoice</th><th>Fee</th><th>Amount</th><th>Due</th><th>Paid</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {fees.invoices?.map((inv: any) => (
                    <tr key={inv.id}>
                      <td className="font-medium">{inv.invoiceNumber}</td>
                      <td>{inv.feeName}</td>
                      <td>₹{inv.amount}</td>
                      <td className="text-sm text-gray-500">{new Date(inv.dueDate).toLocaleDateString('en-IN')}</td>
                      <td className="text-emerald-600">₹{inv.paidAmount}</td>
                      <td><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
