import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMaterials, useMaterialCategories, useDownloadMaterial, usePreviewMaterial, useToggleFavoriteMaterial } from '@/hooks/useMaterials';
import { useAuthStore } from '@/store/auth.store';
import { Download, FileText, Eye, Star, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export const DigitalLibraryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { user } = useAuthStore();
  const { data: materialsData, isLoading } = useMaterials();
  const { data: categories } = useMaterialCategories();
  const toggleFavoriteMutation = useToggleFavoriteMaterial();
  const downloadMutation = useDownloadMaterial();
  const previewMutation = usePreviewMaterial();

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;

  const materials = materialsData?.data || [];

  // Filter materials
  const filteredMaterials = materials.filter((mat: any) => {
    const matchesSearch = mat.title.toLowerCase().includes(search.toLowerCase()) ||
      (mat.topic && mat.topic.toLowerCase().includes(search.toLowerCase())) ||
      (mat.chapter && mat.chapter.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = !selectedCategory || mat.categoryId === selectedCategory;
    const matchesSubject = !selectedSubject || mat.subjectId === selectedSubject;
    
    // Check if the current student favorited this
    const isFav = mat.favorites?.some((fav: any) => fav.studentId === user?.student?.id);
    const matchesFavorites = !showFavoritesOnly || isFav;

    return matchesSearch && matchesCategory && matchesSubject && matchesFavorites;
  });

  const handleDownload = async (id: string) => {
    try {
      const response = await downloadMutation.mutateAsync(id);
      const url = response.data?.url;
      if (url) {
        window.open(url, '_blank');
        toast.success('Download started');
      } else {
        toast.error('Download link not available');
      }
    } catch {
      toast.error('Download failed');
    }
  };

  const handlePreview = async (id: string) => {
    try {
      const response = await previewMutation.mutateAsync(id);
      const url = response.data?.url;
      if (url) {
        window.open(url, '_blank');
      } else {
        toast.error('Preview not available');
      }
    } catch {
      toast.error('Preview failed');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleFavoriteMutation.mutateAsync(id);
      toast.success('Library updated');
    } catch {
      toast.error('Failed to update favorite status');
    }
  };

  // Extract unique subjects for filtering
  const uniqueSubjects = Array.from(
    new Map(
      materials
        .filter((m: any) => m.subject)
        .map((m: any) => [m.subject.id, m.subject])
    ).values()
  );

  return (
    <div id="digital-library-page" className="space-y-6">
      <PageHeader
        title="Digital Library"
        description="Browse, preview, and download your worksheets, study notes, and assignments."
      />

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, chapter or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-gray-400 font-semibold uppercase">
            <Filter className="h-3.5 w-3.5" /> Filters:
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl focus:outline-none text-sm text-gray-600 bg-white"
          >
            <option value="">All Categories</option>
            {categories?.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl focus:outline-none text-sm text-gray-600 bg-white"
          >
            <option value="">All Subjects</option>
            {uniqueSubjects.map((sub: any) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition font-medium ${
              showFavoritesOnly
                ? 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100/75'
                : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
            }`}
          >
            <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            Starred
          </button>
        </div>
      </div>

      {/* Library Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((mat: any) => {
            const isFav = mat.favorites?.some((fav: any) => fav.studentId === user?.student?.id);
            return (
              <div
                key={mat.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                      <FileText className="h-5 w-5" />
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(mat.id)}
                      className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 text-gray-400 hover:text-yellow-500 transition"
                      title={isFav ? 'Remove star' : 'Star file'}
                    >
                      <Star className={`h-4.5 w-4.5 ${isFav ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </button>
                  </div>

                  <h4 className="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-primary-600 transition">
                    {mat.title}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 h-8">
                    {mat.description || 'No description provided.'}
                  </p>

                  <div className="space-y-1.5 mb-4">
                    {mat.category && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Category</span>
                        <span className="font-semibold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md">{mat.category.name}</span>
                      </div>
                    )}
                    {mat.subject && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Subject</span>
                        <span className="font-semibold text-gray-700">{mat.subject.name}</span>
                      </div>
                    )}
                    {(mat.chapter || mat.topic) && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Topic</span>
                        <span className="font-semibold text-gray-600 line-clamp-1">
                          {mat.chapter ? `${mat.chapter} › ` : ''}{mat.topic || ''}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Size</span>
                      <span className="font-semibold text-gray-600">{Math.round(mat.fileSize / 1024)} KB</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-4 border-t border-gray-50">
                  <button
                    onClick={() => handlePreview(mat.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </button>
                  <button
                    onClick={() => handleDownload(mat.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No materials found"
          description="Try modifying your search queries or filters above."
        />
      )}
    </div>
  );
};
