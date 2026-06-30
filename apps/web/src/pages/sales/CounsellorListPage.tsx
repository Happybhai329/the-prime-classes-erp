import React, { useState } from 'react';
import {
  useCounsellors,
  useCreateCounsellor,
  useUpdateCounsellor,
  useDeleteCounsellor,
} from '@/hooks/useSales';
import { PageHeader } from '@/components/ui/PageHeader';
import { Loader2, Plus, Edit2, Trash2, X, Target, Award } from 'lucide-react';

export const CounsellorListPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCounsellor, setEditingCounsellor] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    targetAdmissions: 10,
    targetRevenue: 100000,
    active: true,
  });

  const { data: counsellorsRes, isLoading } = useCounsellors();
  const createMutation = useCreateCounsellor();
  const updateMutation = useUpdateCounsellor();
  const deleteMutation = useDeleteCounsellor();

  const counsellors = counsellorsRes?.data || counsellorsRes || [];

  const handleOpenAdd = () => {
    setEditingCounsellor(null);
    setFormData({
      name: '',
      email: '',
      mobile: '',
      targetAdmissions: 10,
      targetRevenue: 100000,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (counsellor: any) => {
    setEditingCounsellor(counsellor);
    setFormData({
      name: counsellor.name,
      email: counsellor.email,
      mobile: counsellor.mobile,
      targetAdmissions: counsellor.targetAdmissions || 0,
      targetRevenue: Number(counsellor.targetRevenue || 0),
      active: counsellor.active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCounsellor) {
      updateMutation.mutate(
        { id: editingCounsellor.id, data: formData },
        { onSuccess: () => setIsModalOpen(false) }
      );
    } else {
      createMutation.mutate(formData, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this counsellor?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Counsellor Management"
        description="Configure admission counsellors, assign monthly targets, and track performance milestones."
        actions={
          <button
            onClick={handleOpenAdd}
            className="btn btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <Plus className="h-4 w-4" /> Add Counsellor
          </button>
        }
      />

      {/* Counsellors Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary-600 h-8 w-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counsellors.map((c: any) => (
            <div key={c.id} className="card p-5 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{c.name}</h3>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{c.email}</p>
                  <p className="text-[10px] text-gray-400">Mob: {c.mobile}</p>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                    c.active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}
                >
                  {c.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              {/* Targets Progress */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-gray-500 font-medium">
                    <Award className="h-3.5 w-3.5" /> Admissions
                  </div>
                  <div className="text-sm font-bold text-gray-900">{c.targetAdmissions}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-gray-500 font-medium">
                    <Target className="h-3.5 w-3.5" /> Revenue Target
                  </div>
                  <div className="text-sm font-bold text-primary-700">₹{(Number(c.targetRevenue) || 0).toLocaleString()}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 text-xs">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="btn btn-secondary py-1 px-2.5 flex items-center gap-1 text-[10px]"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Targets
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="btn btn-secondary border-red-200 text-red-700 hover:bg-red-50 py-1 px-2.5 flex items-center gap-1 text-[10px]"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
          {counsellors.length === 0 && (
            <div className="col-span-full card p-8 text-center text-gray-400 text-xs">
              No counsellors added yet. Click 'Add Counsellor' to create one.
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Counsellor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="bg-primary-700 p-5 text-white flex justify-between items-center">
              <h3 className="text-sm font-semibold">
                {editingCounsellor ? 'Edit Counsellor' : 'Add Counsellor'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Counsellor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Admissions *</label>
                  <input
                    type="number"
                    required
                    value={formData.targetAdmissions}
                    onChange={(e) => setFormData({ ...formData, targetAdmissions: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Revenue (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.targetRevenue}
                    onChange={(e) => setFormData({ ...formData, targetRevenue: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active-check"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="active-check" className="font-semibold text-gray-700">Active status (participates in assignment)</label>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-1.5"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="animate-spin h-4 w-4" />
                )}
                Save Counsellor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
