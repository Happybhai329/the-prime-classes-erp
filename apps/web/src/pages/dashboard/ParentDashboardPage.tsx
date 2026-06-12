import React from 'react';
import { useParentDashboard } from '@/hooks/useDashboard';
import { useParentLedgerReport } from '@/hooks/useFees';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Calendar, Award, BookOpen, AlertCircle, IndianRupee } from 'lucide-react';

export const ParentDashboardPage: React.FC = () => {
  const { data: dashboardData, isLoading } = useParentDashboard();

  if (isLoading || !dashboardData) return <LoadingSpinner size="lg" className="py-20" />;

  return (
    <div id="parent-dashboard-page" className="max-w-6xl mx-auto">
      <PageHeader 
        title="Parent Portal" 
        description="Track your children's academic progress and attendance" 
      />

      {dashboardData.children.length === 0 ? (
        <div className="card p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">No Children Linked</h2>
          <p className="text-gray-500 mt-2">Please contact the administration to link your profile with your children's records.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {dashboardData.children.map((child: any) => (
            <div key={child.studentId} className="card overflow-hidden">
              <div className="bg-gradient-to-r from-primary-700 to-primary-900 p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{child.studentName}</h2>
                  <p className="text-primary-100 opacity-90 mt-1">Roll #: {child.rollNumber} • Batch: {child.batchName}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-primary-200">Overall Attendance</span>
                  <p className="text-3xl font-bold">{child.attendancePercentage}%</p>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent-500" /> Recent Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {child.recentTests.length > 0 ? (
                    child.recentTests.map((test: any, i: any) => (
                      <div key={i} className="border border-gray-100 bg-gray-50 rounded-xl p-4">
                        <p className="text-sm font-medium text-gray-900 truncate" title={test.testName}>{test.testName}</p>
                        <p className="text-xs text-gray-500 mt-1">{test.testDate}</p>
                        <div className="mt-3 flex justify-between items-end">
                          <div>
                            <span className="text-2xl font-bold text-gray-900">{test.percentage}%</span>
                            <span className="text-xs text-gray-500 ml-1">({test.marksObtained}/{test.totalMarks})</span>
                          </div>
                          {test.batchRank && (
                            <span className="badge bg-primary-50 text-primary-700">Rank {test.batchRank}</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-6 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      No test results published yet.
                    </div>
                  )}
                </div>

                {/* Parent Fee Integration */}
                <ParentFeeSection studentId={child.studentId} />
              </div>
            </div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600" /> Upcoming Tests
              </h3>
              <div className="space-y-3">
                {dashboardData.upcomingTests.length > 0 ? (
                  dashboardData.upcomingTests.map((t: any) => (
                    <div key={t.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-white">
                      <div>
                        <p className="font-medium text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.batchName}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-primary-600">{t.testDate}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No upcoming tests scheduled.</p>
                )}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary-600" /> Recent Notices
              </h3>
              <div className="space-y-3">
                {dashboardData.recentNotices.length > 0 ? (
                  dashboardData.recentNotices.map((n: any) => (
                    <div key={n.id} className="p-3 border border-gray-100 rounded-lg bg-white relative">
                      {!n.isRead && <span className="absolute top-3 right-3 w-2 h-2 bg-primary-500 rounded-full" />}
                      <p className="font-medium text-gray-900 text-sm pr-4">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{n.body}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(n.sentAt).toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recent notices.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ParentFeeSection: React.FC<{ studentId: string }> = ({ studentId }) => {
  const { data: ledger, isLoading } = useParentLedgerReport();

  if (isLoading || !ledger) return null;

  const childLedger = ledger.find((l: any) => l.studentId === studentId);

  if (!childLedger) return null;

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <IndianRupee className="h-5 w-5 text-indigo-600" /> Fees & Invoices
      </h3>

      <div className="space-y-4">
        {childLedger.feePlans.map((plan: any) => (
          <div key={plan.feePlanName} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-sm text-gray-900">{plan.feePlanName}</p>
                <p className="text-xs text-gray-500 mt-0.5">Total: ₹{plan.totalAmount.toLocaleString()} • Paid: ₹{plan.paidAmount.toLocaleString()}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                plan.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {plan.status}
              </span>
            </div>

            {/* Installments */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {plan.installments.map((inst: any) => (
                <div key={inst.id} className="bg-white border rounded-lg p-2.5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-gray-800">{inst.label}</p>
                    <p className="text-gray-400 mt-0.5">Due: {inst.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{inst.amount.toLocaleString()}</p>
                    <span className={`text-[9px] font-bold ${
                      inst.status === 'PAID' ? 'text-emerald-600' : 'text-amber-500'
                    }`}>{inst.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
