import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileTypeEnum } from '@/models/file';
import { fileService } from '@/services/fileService';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import PageSubTitle from '@/components/common/PageSubTitle';
import PageTitle from '@/components/common/PageTitle';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { FileUploadField } from '@/components/common/FileUploadField';
import { useSuccessToast } from '@/hooks/useSuccessToast';

export default function NewAsset() {
  const navigate = useNavigate();
  const { showSuccessToast } = useSuccessToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<any>(null);

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;

    setSelectedFile(file);
    setError('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fileService.uploadFile(
        FileTypeEnum.ASSETS,
        formData,
      );

      if (response.success && response.data.file) {
        setUploadedFile(response.data.file);
        setSelectedFile(null);
        showSuccessToast('Asset uploaded successfully.');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <Breadcrumb
        items={[{ label: 'Assets', href: '/assets' }, { label: 'New Asset' }]}
      />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <PageTitle title="Create New Asset" />
          <PageSubTitle text="Upload a new file to your assets" />
        </div>

        {/* Form Card */}
        <div className="relative rounded-lg border border-border bg-card shadow-md p-6">
          <LoadingOverlay visible={isUploading} />
          <div className="space-y-3">
            {/* Asset Type is fixed to ASSETS; no selection needed */}

            {/* File Upload Area */}
            <FileUploadField
              label="Select File *"
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              disabled={isUploading}
              uploadedFile={uploadedFile}
            />

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-md text-sm border border-red-500/30 bg-red-500/10 text-red-800 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {uploadedFile && (
              <div className="p-4 rounded-md text-sm border border-green-500/30 bg-green-500/10 text-green-800 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">File uploaded successfully!</p>
                  <p className="text-xs text-green-700 mt-1">
                    Name: {uploadedFile.name}
                  </p>
                  <p className="text-xs text-green-700">
                    Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate('/assets')}
                disabled={isUploading}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
