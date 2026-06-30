import React, { useState } from 'react';
import {
  useEnquiries,
  useCreateEnquiry,
  useUpdateEnquiry,
  useDeleteEnquiry,
  useBulkDeleteEnquiries,
  useImportEnquiriesCsv,
  useCounsellors,
  useConvertFromEnquiry,
} from '@/hooks/useSales';
import { PageHeader } from '@/components/ui/PageHeader';
import { salesService } from '@/services/sales.service';
import {
  Loader2,
  Plus,
  Trash2,
  Download,
  Upload,
  Edit2,
  UserPlus,
  X,
  Search,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const EnquiryListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [counsellorId, setCounsellorId] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState<any>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assigningEnquiryId, setAssigningEnquiryId] = useState<string | null>(null);
  const [targetCounsellor, setTargetCounsellor] = useState('');

  // Forms state
  const [formData, setFormData] = useState({
    studentName: '',
    mobile: '',
    email: '',
    fatherName: '',
    motherName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    class: '',
    targetExam: '',
    academicYear: '2026-27',
    source: 'MANUAL',
    alternateMobile: '',
    assignedCounsellor: '',
    campaign: '',
    referencePerson: '',
    remarks: '',
  });

  const { data: enquiriesRes, isLoading } = useEnquiries({
    page,
    limit: 15,
    search,
    status: status || undefined,
    source: source || undefined,
    counsellorId: counsellorId || undefined,
  });

  const { data: counsellors } = useCounsellors({ active: 'true' });

  // Mutations
  const createMutation = useCreateEnquiry();
  const updateMutation = useUpdateEnquiry();
  const deleteMutation = useDeleteEnquiry();
  const bulkDeleteMutation = useBulkDeleteEnquiries();
  const importCsvMutation = useImportEnquiriesCsv();
  const convertMutation = useConvertFromEnquiry();

  const enquiries = enquiriesRes?.data || [];
  const meta = enquiriesRes?.meta;

  const handleOpenAdd = () => {
    setEditingEnquiry(null);
    setFormData({
      studentName: '',
      mobile: '',
      email: '',
      fatherName: '',
      motherName: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      class: '',
      targetExam: '',
      academicYear: '2026-27',
      source: 'MANUAL',
      alternateMobile: '',
      assignedCounsellor: '',
      campaign: '',
      referencePerson: '',
      remarks: '',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (enquiry: any) => {
    setEditingEnquiry(enquiry);
    setFormData({
      studentName: enquiry.studentName,
      mobile: enquiry.mobile,
      email: enquiry.email || '',
      fatherName: enquiry.fatherName || '',
      motherName: enquiry.motherName || '',
      address: enquiry.address || '',
      city: enquiry.city || '',
      state: enquiry.state || '',
      pincode: enquiry.pincode || '',
      class: enquiry.class || '',
      targetExam: enquiry.targetExam || '',
      academicYear: enquiry.academicYear || '2026-27',
      source: enquiry.source || 'MANUAL',
      alternateMobile: enquiry.alternateMobile || '',
      assignedCounsellor: enquiry.assignedCounsellor || '',
      campaign: enquiry.campaign || '',
      referencePerson: enquiry.referencePerson || '',
      remarks: enquiry.remarks || '',
    });
    setIsAddEditOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEnquiry) {
      updateMutation.mutate(
        { id: editingEnquiry.id, data: formData },
        { onSuccess: () => setIsAddEditOpen(false) }
      );
    } else {
      createMutation.mutate(formData, { onSuccess: () => setIsAddEditOpen(false) });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this enquiry?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete the ${selectedIds.length} selected enquiries?`)) {
      bulkDeleteMutation.mutate(selectedIds, {
        onSuccess: () => setSelectedIds([]),
      });
    }
  };

  const handleExport = async () => {
    try {
      const csvBlob = await salesService.exportEnquiriesCsv({
        status: status || undefined,
        source: source || undefined,
        counsellorId: counsellorId || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([csvBlob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'enquiries-export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Enquiries exported successfully');
    } catch {
      toast.error('Failed to export enquiries');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importCsvMutation.mutate(file);
    }
  };

  const handleAssignCounsellor = (e: React.FormEvent) => {
    e.preventDefault();
    if (assigningEnquiryId && targetCounsellor) {
      updateMutation.mutate(
        {
          id: assigningEnquiryId,
          data: { assignedCounsellor: targetCounsellor },
        },
        {
          onSuccess: () => {
            setIsAssignOpen(false);
            setAssigningEnquiryId(null);
            setTargetCounsellor('');
          },
        }
      );
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === enquiries.length ? [] : enquiries.map((e: any) => e.id)
    );
  };

  const handleConvert = (id: string) => {
    if (confirm('Convert this enquiry into an Admission? All details will copy automatically.')) {
      convertMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enquiry Management"
        description="View and manage prospective student enquiries, assign counsellors, and track follow-ups."
        actions={
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExport} className="btn btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3">
              <Download className="h-4 w-4" /> Export CSV
            </button>
            <label className="btn btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3 cursor-pointer">
              <Upload className="h-4 w-4" /> Import CSV
              <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
            </label>
            <button onClick={handleOpenAdd} className="btn btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3">
              <Plus className="h-4 w-4" /> Capture Enquiry
            </button>
          </div>
        }
      />

      {/* Filters & Search */}
      <div className="card p-5 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search student or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-xs"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="ADMISSION_PENDING">Admission Pending</option>
            <option value="CONVERTED">Converted</option>
          </select>

          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-xs"
          >
            <option value="">All Sources</option>
            <option value="WEBSITE_FORM">Website Form</option>
            <option value="GOOGLE_ADS">Google Ads</option>
            <option value="FACEBOOK_ADS">Facebook Ads</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="MANUAL">Manual Entry</option>
          </select>

          <select
            value={counsellorId}
            onChange={(e) => setCounsellorId(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-xs"
          >
            <option value="">All Counsellors</option>
            {counsellors?.data?.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-red-50 p-2.5 rounded-lg border border-red-200">
            <span className="text-xs font-semibold text-red-700">
              {selectedIds.length} enquiries selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="btn btn-secondary border-red-300 text-red-700 hover:bg-red-100 flex items-center gap-1 text-xs py-1 px-2.5"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Enquiries Data Table */}
      <div className="card bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[250px]">
            <Loader2 className="animate-spin text-primary-600 h-8 w-8" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === enquiries.length && enquiries.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="p-4">Enq Number</th>
                  <th className="p-4">Student Info</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Target / Class</th>
                  <th className="p-4">Counsellor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {enquiries.map((e: any) => (
                  <tr key={e.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(e.id)}
                        onChange={() => toggleSelect(e.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4 font-mono font-bold text-primary-800">{e.enquiryNumber}</td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{e.studentName}</div>
                      {e.fatherName && <div className="text-[10px] text-gray-500">Father: {e.fatherName}</div>}
                    </td>
                    <td className="p-4">
                      <div>{e.mobile}</div>
                      <div className="text-[10px] text-gray-400">{e.email || 'No Email'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold">{e.targetExam || 'N/A'}</div>
                      <div className="text-[10px] text-gray-500">{e.class || 'No Class'}</div>
                    </td>
                    <td className="p-4">
                      {e.counsellor ? (
                        <span className="font-medium text-gray-800">{e.counsellor.name}</span>
                      ) : (
                        <button
                          onClick={() => {
                            setAssigningEnquiryId(e.id);
                            setIsAssignOpen(true);
                          }}
                          className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Assign
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`badge text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          e.status === 'NEW'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : e.status === 'CONTACTED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : e.status === 'CONVERTED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      {e.status !== 'CONVERTED' && (
                        <button
                          onClick={() => handleConvert(e.id)}
                          className="btn btn-secondary bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-[10px] py-1 px-2"
                        >
                          Convert
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(e)}
                        className="p-1.5 text-gray-500 hover:text-primary-700 rounded-lg hover:bg-gray-100"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="p-1.5 text-gray-500 hover:text-red-700 rounded-lg hover:bg-gray-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {enquiries.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      No enquiries captured yet. Click 'Capture Enquiry' to add manually.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-100">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 bg-white border rounded text-xs disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500">
              Page {meta.page} of {meta.totalPages} ({meta.total} total)
            </span>
            <button
              disabled={page === meta.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 bg-white border rounded text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Capture / Edit Enquiry Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
            <div className="bg-primary-700 p-5 text-white flex justify-between items-center">
              <h3 className="text-lg font-display font-semibold">
                {editingEnquiry ? `Edit Enquiry: ${editingEnquiry.enquiryNumber}` : 'Capture New Enquiry'}
              </h3>
              <button type="button" onClick={() => setIsAddEditOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Student Name *</label>
                <input
                  type="text"
                  required
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Alternate Mobile</label>
                <input
                  type="text"
                  value={formData.alternateMobile}
                  onChange={(e) => setFormData({ ...formData, alternateMobile: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Father Name</label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mother Name</label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Class</label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  placeholder="e.g. Class 6"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Exam</label>
                <input
                  type="text"
                  value={formData.targetExam}
                  onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                  placeholder="e.g. SAINIK"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Lead Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="MANUAL">Manual Entry</option>
                  <option value="WEBSITE_FORM">Website Form</option>
                  <option value="GOOGLE_ADS">Google Ads</option>
                  <option value="FACEBOOK_ADS">Facebook Ads</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Counsellor</label>
                <select
                  value={formData.assignedCounsellor}
                  onChange={(e) => setFormData({ ...formData, assignedCounsellor: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">-- No Counsellor --</option>
                  {counsellors?.data?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg h-16"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-1.5"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="animate-spin h-4 w-4" />
                )}
                Save Enquiry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assign Counsellor Modal */}
      {isAssignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <form onSubmit={handleAssignCounsellor} className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="bg-primary-700 p-5 text-white flex justify-between items-center">
              <h3 className="text-sm font-semibold">Assign Counsellor</h3>
              <button type="button" onClick={() => setIsAssignOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <label className="block font-semibold text-gray-700">Select Counsellor *</label>
              <select
                required
                value={targetCounsellor}
                onChange={(e) => setTargetCounsellor(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500"
              >
                <option value="">-- Choose Counsellor --</option>
                {counsellors?.data?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsAssignOpen(false)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Assign
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
