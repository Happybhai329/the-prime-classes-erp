import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Phone, Mail, Briefcase, AlertCircle } from 'lucide-react';
import { useParent } from '@/hooks/useParents';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const ParentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: parent, isLoading } = useParent(id!);

  if (isLoading) return <LoadingSpinner size="lg" className="h-96" />;
  if (!parent) return null;

  return (
    <div id="parent-detail-page">
      <button onClick={() => navigate('/parents')} className="btn-ghost mb-4 gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Parents
      </button>

      <PageHeader
        title="Parent Profile"
        description="View contact and linked student details"
        actions={
          <button
            onClick={() => navigate(`/parents/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 transition shadow-sm"
          >
            Edit Profile
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              Father Details
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-gray-500">Name</dt>
                <dd className="text-sm font-medium text-gray-900">{parent.fatherName || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</dt>
                <dd className="text-sm font-medium text-gray-900">{parent.fatherPhone || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-500 flex items-center gap-1"><Briefcase className="h-3 w-3" /> Occupation</dt>
                <dd className="text-sm text-gray-900">{parent.fatherOccupation || '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              Mother Details
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-gray-500">Name</dt>
                <dd className="text-sm font-medium text-gray-900">{parent.motherName || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</dt>
                <dd className="text-sm font-medium text-gray-900">{parent.motherPhone || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-500 flex items-center gap-1"><Briefcase className="h-3 w-3" /> Occupation</dt>
                <dd className="text-sm text-gray-900">{parent.motherOccupation || '—'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right Col - Account & Students */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              Account Login
            </h3>
            <p className="text-sm font-medium text-gray-900">{parent.user?.email}</p>
            <p className="text-xs text-gray-500 mt-1">Status: {parent.user?.isActive ? 'Active' : 'Inactive'}</p>
            
            {parent.emergencyContact && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <AlertCircle className="h-3 w-3 text-red-500" /> Emergency Contact
                </p>
                <p className="text-sm font-medium text-gray-900">{parent.emergencyContact}</p>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Linked Students</h3>
            {parent.studentMappings?.length > 0 ? (
              <div className="space-y-3">
                {parent.studentMappings.map((sm: any) => (
                  <div key={sm.student.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-gray-900">
                        {sm.student.firstName} {sm.student.lastName}
                      </p>
                      <StatusBadge status={sm.student.status} />
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Roll: {sm.student.rollNumber} · Class: {sm.student.classStudying}</p>
                    <button onClick={() => navigate(`/students/${sm.student.id}`)} className="text-xs font-medium text-primary-700 hover:text-primary-800">
                      View Student →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No linked students found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
