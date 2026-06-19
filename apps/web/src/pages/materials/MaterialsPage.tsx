import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useMaterials, useMaterialCategories, useCreateMaterialCategory, useUploadMaterial, useDeleteMaterial, useDownloadMaterial, useMaterialAccessLogs } from '@/hooks/useMaterials';
import { useBatches } from '@/hooks/useBatches';
import { Plus, Download, FileText, Trash2, Eye, FolderPlus, Info, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable } from '@/components/ui/DataTable';

export const MaterialsPage: React.FC = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [selectedMatId, setSelectedMatId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [course, setCourse] = useState('');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [deleteMatId, setDeleteMatId] = useState<string | null>(null);

  // Queries & Mutations
  const { data: materialsData, isLoading } = useMaterials();
  const { data: categories } = useMaterialCategories();
  const { data: batchesData } = useBatches({ limit: 100 });
  const createCategoryMutation = useCreateMaterialCategory();
  const uploadMaterialMutation = useUploadMaterial();
  const deleteMaterialMutation = useDeleteMaterial();
  const downloadMutation = useDownloadMaterial();
  const { data: accessLogs } = useMaterialAccessLogs(selectedMatId || '');

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;

  const materials = materialsData?.data || [];
  const batches = batchesData?.data || [];

  const columns = [
    {
      key: 'title',
      header: 'Title / Topic',
      render: (mat: any) => (
        <div className="flex gap-3 items-center">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 line-clamp-1">{mat.title}</p>
            <p className="text-xs text-gray-400">{mat.chapter || 'No Chapter'} • {mat.topic || 'No Topic'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Course / Exam',
      render: (mat: any) => (
        <span className="text-gray-600 font-medium">{mat.course || 'Global Library'}</span>
      ),
    },
    {
      key: 'batch',
      header: 'Batch / Subject',
      render: (mat: any) => (
        <div>
          <span className="text-gray-700 block text-xs font-semibold">{mat.batch?.name || 'All Batches'}</span>
          <span className="text-gray-400 text-xs">{mat.subject?.name || 'All Subjects'}</span>
        </div>
      ),
    },
    {
      key: 'size',
      header: 'Size & Version',
      render: (mat: any) => (
        <div>
          <p className="text-gray-600 font-semibold">{Math.round(mat.fileSize / 1024)} KB</p>
          <p className="text-xs text-gray-400">Ver. {mat.version}</p>
        </div>
      ),
    },
    {
      key: 'uploader',
      header: 'Uploaded By',
      render: (mat: any) => (
        <span className="text-gray-500">{mat.uploader?.email || '—'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (mat: any) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleDownload(mat.id)}
            className="p-2 text-gray-500 hover:text-amber-500 hover:bg-gray-100 rounded-lg transition"
            title="Download file"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => openLogs(mat.id)}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition"
            title="View access logs"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteMatId(mat.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
            title="Delete file"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
  const totalSizeMB = Math.round(materials.reduce((acc: number, m: any) => acc + m.fileSize, 0) / (1024 * 1024));

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) {
      toast.error('Title and file are required');
      return;
    }

    try {
      await uploadMaterialMutation.mutateAsync({
        title,
        description,
        categoryId: categoryId || undefined,
        batchId: batchId || undefined,
        course: course || undefined,
        chapter: chapter || undefined,
        topic: topic || undefined,
        file,
      });
      toast.success('Material uploaded successfully');
      setIsUploadOpen(false);
      // Reset form
      setTitle('');
      setDescription('');
      setCategoryId('');
      setBatchId('');
      setCourse('');
      setChapter('');
      setTopic('');
      setFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName) return;
    try {
      await createCategoryMutation.mutateAsync(newCatName);
      toast.success('Category created');
      setNewCatName('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteMatId) return;
    try {
      await deleteMaterialMutation.mutateAsync(deleteMatId);
      toast.success('Material deleted');
      setDeleteMatId(null);
    } catch {
      toast.error('Deletion failed');
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await downloadMutation.mutateAsync(id);
      const url = response.data?.url;
      if (url) window.open(url, '_blank');
    } catch {
      toast.error('Download failed');
    }
  };

  const openLogs = (id: string) => {
    setSelectedMatId(id);
    setIsLogsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Study Material Management"
          description="Aesthetic course files, question papers, and worksheets repository."
        />
        <div className="flex gap-2">
          <button
            onClick={() => setIsCategoryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            <FolderPlus className="h-4 w-4" /> Configure Categories
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 transition shadow-sm"
          >
            <Plus className="h-4 w-4" /> Upload Material
          </button>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">📂</div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Materials</p>
            <h4 className="text-2xl font-bold text-gray-900">{materials.length}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">💾</div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Storage Consumed</p>
            <h4 className="text-2xl font-bold text-gray-900">{totalSizeMB} MB</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">🗂️</div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Categories</p>
            <h4 className="text-2xl font-bold text-gray-900">{categories?.length || 0}</h4>
          </div>
        </div>
      </div>

      {/* Materials List Table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <DataTable
          columns={columns}
          data={materials}
          isLoading={isLoading}
          emptyTitle="No Study Materials Found"
          emptyDescription="Configure categories and upload files to start sharing study materials."
        />
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Course Material</h3>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
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
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Batch</label>
                  <select
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  >
                    <option value="">Select Batch</option>
                    {batches.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Course (Exam)</label>
                  <input
                    type="text"
                    placeholder="e.g. SAINIK"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Chapter</label>
                  <input
                    type="text"
                    placeholder="e.g. Algebra"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. Equations"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Choose File *</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadMaterialMutation.isPending}
                  className="px-4 py-2 rounded-lg text-sm text-white bg-amber-500 hover:bg-amber-600 transition"
                >
                  {uploadMaterialMutation.isPending ? 'Uploading...' : 'Save Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Categories Modal */}
      {isCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Material Categories</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="New category name"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                onClick={handleCreateCategory}
                className="px-4 py-2 text-sm text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition"
              >
                Add
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1.5 mb-6">
              {categories?.map((c: any) => (
                <div key={c.id} className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 flex justify-between items-center">
                  <span>{c.name}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsCategoryOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Access Logs Modal */}
      {isLogsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-amber-500" /> Material Access Logs
            </h3>
            <div className="max-h-72 overflow-y-auto space-y-3 mb-6">
              {accessLogs?.map((log: any) => (
                <div key={log.id} className="p-3 bg-gray-50 rounded-lg text-xs flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{log.user.email} ({log.user.role})</p>
                    <p className="text-gray-400">Action: {log.action} • IP: {log.ipAddress || 'unknown'}</p>
                  </div>
                  <div className="text-right text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
              {accessLogs?.length === 0 && (
                <p className="text-center py-6 text-gray-400 text-sm">No download or preview records yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteMatId}
        onClose={() => setDeleteMatId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Study Material"
        message="Are you sure you want to permanently delete this study material? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
        isLoading={deleteMaterialMutation.isPending}
      />
    </div>
  );
};
