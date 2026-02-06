'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TrainingStatus } from '@/models/training';
import {
  useUpdateTrainingMutation,
  useTrainingById,
} from '@/hooks/useTrainings';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import PageTitle from '@/components/common/PageTitle';
import PageSubTitle from '@/components/common/PageSubTitle';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { fileService } from '@/services/fileService';
import { FileTypeEnum } from '@/models/file';
import { FileText, Loader2 } from 'lucide-react';
import { FileUploadField } from '@/components/common/FileUploadField';
import { useSuccessToast } from '@/hooks/useSuccessToast';

export default function EditTraining() {
  const navigate = useNavigate();
  const { trainingId } = useParams<{ trainingId: string }>();
  const { data: trainingData, isLoading: isLoadingTraining } =
    useTrainingById(trainingId);
  const updateTrainingMutation = useUpdateTrainingMutation(trainingId!);
  const { showSuccessToast } = useSuccessToast();
  const [error, setError] = useState<string | null>(null);
  const [metadataFile, setMetadataFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedMetadataFile, setUploadedMetadataFile] = useState<{
    name: string;
    size: number;
    storageKey: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    metadataFilePath: '',
    status: TrainingStatus.COMPLETED.toString(),
  });

  // Pre-fill form with existing training data
  useEffect(() => {
    if (trainingData?.data) {
      setFormData((prev) => ({
        ...prev,
        title: trainingData.data.title,
        metadataFilePath: trainingData.data.metadataFilePath || '',
        status: trainingData.data.status.toString(),
      }));
      if (trainingData.data.metadataFilePath) {
        const storageKey = trainingData.data.metadataFilePath;
        const name = storageKey.split('/').pop() || storageKey;
        setUploadedMetadataFile({ name, size: 0, storageKey });
      }
    }
  }, [trainingData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.metadataFilePath) {
      setError('Metadata file is required');
      return;
    }

    setError(null);

    updateTrainingMutation.mutate(
      {
        title: formData.title,
        metadataFilePath: formData.metadataFilePath,
        status: Number(formData.status),
      },
      {
        onSuccess: () => {
          showSuccessToast('Training updated successfully.');
          navigate('/trainings');
        },
        onError: (err: any) => {
          setError(
            err instanceof Error ? err.message : 'Failed to update training',
          );
        },
      },
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value ? value : prev.status,
    }));
  };

  const handleMetadataFileChange = async (file: File | null) => {
    if (!file) return;

    // Validate file type (JSON only)
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }

    setMetadataFile(file);
    setUploading(true);
    setError(null);

    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append('file', file);

      const fileUploadResponse = await fileService.uploadFile(
        FileTypeEnum.ASSETS,
        formDataToUpload,
      );

      if (
        fileUploadResponse.success &&
        fileUploadResponse.data.file.storageKey
      ) {
        setFormData((prev) => ({
          ...prev,
          metadataFilePath: fileUploadResponse.data.file.storageKey,
        }));
        setUploadedMetadataFile({
          name: fileUploadResponse.data.file.name,
          size: fileUploadResponse.data.file.size,
          storageKey: fileUploadResponse.data.file.storageKey,
        });
      } else {
        setError('Failed to upload file');
        setMetadataFile(null);
        setUploadedMetadataFile(null);
      }
    } catch (error) {
      console.error('Metadata file upload error:', error);
      setError('Failed to upload metadata file');
      setMetadataFile(null);
      setUploadedMetadataFile(null);
      setFormData((prev) => ({
        ...prev,
        metadataFilePath: '',
      }));
    } finally {
      setUploading(false);
    }
  };

  if (isLoadingTraining) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!trainingData?.data) {
    return <div className="text-center text-red-600">Training not found</div>;
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Trainings', href: '/trainings' },
          { label: 'Edit Training' },
        ]}
      />

      <div className="mb-8">
        <PageTitle title="Edit Training" />
        <PageSubTitle text="Update training details and metadata configuration" />
      </div>

      <div className="relative rounded-lg border border-border bg-card shadow-md p-6">
        <LoadingOverlay
          visible={updateTrainingMutation.isPending || uploading}
        />
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="text-red-600">{error}</div>}

          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium mb-2 text-heading">
              Training Title *
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Professional Development Workshop"
              disabled={updateTrainingMutation.isPending}
            />
          </div>

          {/* Metadata File Upload */}
          <div>
            <div className="space-y-3">
              <FileUploadField
                label="Metadata File (JSON) *"
                selectedFile={metadataFile}
                onFileSelect={handleMetadataFileChange}
                disabled={uploading || updateTrainingMutation.isPending}
                accept=".json,application/json"
                helperText="Upload a JSON file containing training metadata"
                uploadedFile={uploadedMetadataFile}
              />

              {metadataFile && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    {metadataFile.name}
                  </span>
                  {formData.metadataFilePath && (
                    <span className="text-xs text-green-600 ml-auto">
                      Uploaded
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status Field */}
          <div>
            <label className="block text-sm font-medium mb-2 text-heading">
              Status *
            </label>
            <Select
              value={formData.status.toString()}
              onValueChange={handleStatusChange}
              disabled={updateTrainingMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TrainingStatus.UPCOMING.toString()}>
                  Upcoming
                </SelectItem>
                <SelectItem value={TrainingStatus.ONGOING.toString()}>
                  Ongoing
                </SelectItem>
                <SelectItem value={TrainingStatus.COMPLETED.toString()}>
                  Completed
                </SelectItem>
                <SelectItem value={TrainingStatus.DELETED.toString()}>
                  Deleted
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/trainings')}
              disabled={updateTrainingMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                updateTrainingMutation.isPending ||
                !formData.title.trim() ||
                !formData.metadataFilePath ||
                formData.status === undefined ||
                formData.status === null
              }
            >
              {updateTrainingMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
