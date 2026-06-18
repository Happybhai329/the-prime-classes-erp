import React, { useState } from 'react';
import { Plus, Edit2, ShieldAlert, Key, UserX, UserCheck, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useToggleUserActive,
  useAdminResetPassword,
} from '@/hooks/useUsers';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { UserRole } from '@prime/shared-types';

const roleOptions = Object.values(UserRole).map((val) => ({
  value: val,
  label: val,
}));

const statusOptions = [
  { value: 'true', label: 'Active Only' },
  { value: 'false', label: 'Inactive Only' },
];

interface UserFormValues {
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
}

export const UsersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string | undefined>();
  const [isActive, setIsActive] = useState<string | undefined>();

  const [editUser, setEditUser] = useState<any | null>(null);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useUsers({
    page,
    limit: 20,
    search,
    role: role as UserRole,
    isActive,
  });

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const toggleMutation = useToggleUserActive();
  const resetPasswordMutation = useAdminResetPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: {
      email: '',
      phone: '',
      password: '',
      role: UserRole.FACULTY,
      isActive: true,
    },
  });

  const handleOpenAddModal = () => {
    setEditUser(null);
    reset({
      email: '',
      phone: '',
      password: '',
      role: UserRole.FACULTY,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: any) => {
    setEditUser(user);
    reset({
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive,
    });
    setIsModalOpen(true);
  };

  const onSubmitForm = (data: UserFormValues) => {
    if (editUser) {
      updateMutation.mutate(
        { id: editUser.id, data },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditUser(null);
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
      });
    }
  };

  const columns = [
    {
      key: 'email',
      header: 'User / Email',
      render: (u: any) => (
        <div>
          <span className="font-semibold text-gray-900">{u.email}</span>
          {u.phone && <p className="text-xs text-gray-500">{u.phone}</p>}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'System Role',
      render: (u: any) => (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
          u.role === 'SUPER_ADMIN' 
            ? 'bg-purple-100 text-purple-800' 
            : u.role === 'ADMIN'
            ? 'bg-blue-100 text-blue-800'
            : u.role === 'FACULTY'
            ? 'bg-indigo-100 text-indigo-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {u.role}
        </span>
      ),
    },
    {
      key: 'linkedProfile',
      header: 'Linked Profile',
      render: (u: any) => {
        if (u.student) return <span className="text-xs text-gray-600 font-mono">Student: {u.student.firstName} {u.student.lastName} ({u.student.rollNumber})</span>;
        if (u.faculty) return <span className="text-xs text-gray-600 font-mono">Faculty: {u.faculty.firstName} {u.faculty.lastName} ({u.faculty.employeeId})</span>;
        if (u.parent) return <span className="text-xs text-gray-600 font-mono">Parent: {u.parent.fatherName}</span>;
        return <span className="text-gray-400 text-xs">—</span>;
      },
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (u: any) => (
        <button
          onClick={() => toggleMutation.mutate(u.id)}
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer hover:bg-gray-50 ${
            u.isActive 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
          title="Click to toggle status"
          disabled={toggleMutation.isPending}
        >
          {u.isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
          {u.isActive ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24 text-right',
      render: (u: any) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleOpenEditModal(u)}
            className="p-1 text-gray-500 hover:text-indigo-600 rounded hover:bg-gray-100"
            title="Edit User"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setResetPasswordId(u.id)}
            className="p-1 text-gray-500 hover:text-amber-600 rounded hover:bg-gray-100"
            title="Reset Password"
          >
            <Key className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div id="users-page" className="space-y-6">
      <PageHeader
        title="User Accounts"
        description="Manage system login accounts, roles, access status, and passwords"
        actions={
          <button onClick={handleOpenAddModal} className="btn-primary gap-2">
            <Plus className="h-4 w-4" />
            Create User
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by email or phone number..."
          className="flex-1 max-w-md"
        />
        <FilterDropdown
          label="Role"
          options={roleOptions}
          value={role}
          onChange={(v) => {
            setRole(v);
            setPage(1);
          }}
        />
        <FilterDropdown
          label="Status"
          options={statusOptions}
          value={isActive}
          onChange={(v) => {
            setIsActive(v);
            setPage(1);
          }}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyTitle="No user accounts found"
        emptyDescription="Create logins for admin, accountants, or faculty members."
      />

      {/* Pagination */}
      {data?.meta && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-gray-100 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {editUser ? 'Edit User Details' : 'Create User Account'}
              </h3>
              <p className="text-sm text-gray-500 font-sans">
                Set credentials and system role
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
              <div>
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. admin@primeclasses.in"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                  disabled={!!editUser}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-danger-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="label">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  className={`input ${errors.phone ? 'input-error' : ''}`}
                  {...register('phone', {
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Invalid 10-digit Indian mobile number',
                    },
                  })}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-danger-500">{errors.phone.message}</p>
                )}
              </div>

              {!editUser && (
                <div>
                  <label className="label">Initial Password *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={`input ${errors.password ? 'input-error' : ''}`}
                    {...register('password', {
                      required: 'Initial password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters long',
                      },
                    })}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-danger-500">{errors.password.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="label">System Role *</label>
                <select className="input" {...register('role', { required: true })}>
                  {Object.values(UserRole).map((roleVal) => (
                    <option key={roleVal} value={roleVal}>
                      {roleVal}
                    </option>
                  ))}
                </select>
              </div>

              {editUser && (
                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="w-4 h-4 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
                    {...register('isActive')}
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Account Active / Allowed to Log In
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editUser ? (
                    'Save Changes'
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Reset Password Modal */}
      {resetPasswordId && (
        <ResetPasswordModal
          userId={resetPasswordId}
          onClose={() => setResetPasswordId(null)}
          onConfirm={(newPassword) => {
            resetPasswordMutation.mutate(
              { id: resetPasswordId, data: { newPassword } },
              { onSuccess: () => setResetPasswordId(null) }
            );
          }}
          isLoading={resetPasswordMutation.isPending}
        />
      )}
    </div>
  );
};

// Sub-component for reset password
const ResetPasswordModal: React.FC<{
  userId: string;
  onClose: () => void;
  onConfirm: (password: string) => void;
  isLoading: boolean;
}> = ({ onClose, onConfirm, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ password: string }>();

  const onSubmit = (data: { password: string }) => {
    onConfirm(data.password);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-gray-100 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" /> Reset User Password
          </h3>
          <p className="text-sm text-gray-500 mt-1 font-sans">
            Force reset password for this user. They will be logged out of all active devices.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">New Secure Password *</label>
            <input
              type="password"
              placeholder="••••••••"
              className={`input ${errors.password ? 'input-error' : ''}`}
              {...register('password', {
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message: 'Must be at least 8 characters long',
                },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-danger-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Reset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
