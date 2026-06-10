import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useStudent, useUpdateStudent } from '@/hooks/useStudents';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/ui/PageHeader';

export const EditStudentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: student, isLoading } = useStudent(id!);
  const updateMutation = useUpdateStudent();

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (student) {
      const addr = student.address as any || {};
      reset({
        firstName: student.firstName,
        lastName: student.lastName,
        dob: new Date(student.dob).toISOString().split('T')[0],
        gender: student.gender,
        schoolName: student.schoolName,
        classStudying: student.classStudying,
        status: student.status,
        targetExam: student.targetExam,
        street: addr.street || '',
        city: addr.city || '',
        state: addr.state || '',
        pincode: addr.pincode || '',
      });
    }
  }, [student, reset]);

  if (isLoading) return <LoadingSpinner size="lg" className="h-96" />;
  if (!student) return null;

  const onSubmit = (data: any) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      dob: data.dob,
      gender: data.gender,
      schoolName: data.schoolName,
      classStudying: data.classStudying,
      status: data.status,
      targetExam: data.targetExam,
      address: { street: data.street, city: data.city, state: data.state, pincode: data.pincode },
    };
    updateMutation.mutate({ id: id!, data: payload }, { onSuccess: () => navigate(`/students/${id}`) });
  };

  return (
    <div id="edit-student-page">
      <button onClick={() => navigate(`/students/${id}`)} className="btn-ghost mb-4 gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Student
      </button>
      <PageHeader title="Edit Student" description={`${student.firstName} ${student.lastName} · ${student.rollNumber}`} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input className="input" {...register('firstName', { required: true })} />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input className="input" {...register('lastName', { required: true })} />
            </div>
            <div>
              <label className="label">Date of Birth *</label>
              <input type="date" className="input" {...register('dob', { required: true })} />
            </div>
            <div>
              <label className="label">Gender *</label>
              <select className="input" {...register('gender')}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="label">School Name *</label>
              <input className="input" {...register('schoolName', { required: true })} />
            </div>
            <div>
              <label className="label">Class Studying *</label>
              <input className="input" {...register('classStudying', { required: true })} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" {...register('status')}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PASSED_OUT">Passed Out</option>
                <option value="DROPPED">Dropped</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Target Exams</label>
            <div className="flex flex-wrap gap-3">
              {['SAINIK', 'RMS', 'RIMC', 'SCHOLARSHIP', 'FOUNDATION'].map((exam) => (
                <label key={exam} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" value={exam} className="w-4 h-4 rounded border-gray-300 text-primary-700" {...register('targetExam')} />
                  <span className="text-sm text-gray-700">{exam}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Street</label>
              <input className="input" {...register('street')} />
            </div>
            <div><label className="label">City</label><input className="input" {...register('city')} /></div>
            <div><label className="label">State</label><input className="input" {...register('state')} /></div>
            <div><label className="label">Pincode</label><input className="input" maxLength={6} {...register('pincode')} /></div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate(`/students/${id}`)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};
