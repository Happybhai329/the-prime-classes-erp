import React from 'react';
import { useDocuments, useDownloadDocument } from '@/hooks/useDocuments';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Download, FileText } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const { data, isLoading } = useDocuments();
  const downloadMutation = useDownloadDocument();

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;

  const documents = data?.data || [];

  const handleDownload = async (id: string) => {
    try {
      const response = await downloadMutation.mutateAsync(id);
      const url = response.data?.url;
      if (url) window.open(url, '_blank');
    } catch (err) {
      console.error('Failed to get download URL', err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Document Center" 
        description="Access and manage important files"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc: any) => (
          <div key={doc.id} className="card p-6 flex flex-col">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-primary-100 flex items-center justify-center text-primary-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1" title={doc.title}>{doc.title}</h3>
                  <p className="text-xs text-gray-500">{doc.documentType}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <span>{Math.round(doc.fileSize / 1024)} KB</span>
              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
            </div>
            <button 
              onClick={() => handleDownload(doc.id)}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4" /> Download
            </button>
          </div>
        ))}

        {documents.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white shadow rounded-lg border border-dashed border-gray-200">
            No documents available.
          </div>
        )}
      </div>
    </div>
  );
};
