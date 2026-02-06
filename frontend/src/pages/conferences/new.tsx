"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ConferenceStatus } from "@/models/conference";
import { useCreateConferenceMutation } from "@/hooks/useConferences";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageTitle from "@/components/common/PageTitle";
import PageSubTitle from "@/components/common/PageSubTitle";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { fileService } from "@/services/fileService";
import { FileTypeEnum } from "@/models/file";
import { FileUploadField } from "@/components/common/FileUploadField";
import { useSuccessToast } from "@/hooks/useSuccessToast";
import { formatDateFromInput } from "@/utils/dateFormatter";

export default function NewConference() {
  const navigate = useNavigate();
  const createConferenceMutation = useCreateConferenceMutation();
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
    title: "",
    slug: "",
    startAt: "",
    endAt: "",
    submissionPeriodStartAt: "",
    submissionPeriodEndAt: "",
    metadataFilePath: "",
    status: ConferenceStatus.ACTIVE,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.slug.trim()) {
      setError("Slug is required");
      return;
    }

    if (
      !formData.startAt ||
      !formData.endAt ||
      !formData.submissionPeriodStartAt ||
      !formData.submissionPeriodEndAt
    ) {
      setError("All date fields are required");
      return;
    }

    if (formData.endAt < formData.startAt) {
      setError('End Date must be on or after Start Date');
      return;
    }

    if (formData.submissionPeriodEndAt < formData.submissionPeriodStartAt) {
      setError('Submission End Date must be on or after Submission Start Date');
      return;
    }

    if (!formData.metadataFilePath) {
      setError("Metadata file is required");
      return;
    }

    setError(null);

    createConferenceMutation.mutate(
      {
        title: formData.title,
        slug: formData.slug,
        startAt: formatDateFromInput(formData.startAt),
        endAt: formatDateFromInput(formData.endAt),
        submissionPeriodStartAt: formatDateFromInput(
          formData.submissionPeriodStartAt,
        ),
        submissionPeriodEndAt: formatDateFromInput(
          formData.submissionPeriodEndAt,
        ),
        metadataFilePath: formData.metadataFilePath,
        status: formData.status,
      },
      {
        onSuccess: () => {
          showSuccessToast("Conference created successfully.");
          navigate("/conferences");
        },
        onError: (err: any) => {
          setError(
            err instanceof Error ? err.message : "Failed to create conference",
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
      status: parseInt(value, 10),
    }));
  };

  const handleMetadataFileChange = async (file: File | null) => {
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setError("Please upload a JSON file");
      return;
    }

    setMetadataFile(file);
    setUploading(true);
    setError(null);

    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append("file", file);

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
        setError("Failed to upload file");
        setMetadataFile(null);
        setUploadedMetadataFile(null);
      }
    } catch (uploadError) {
      console.error("Metadata file upload error:", uploadError);
      setError("Failed to upload metadata file");
      setMetadataFile(null);
      setUploadedMetadataFile(null);
      setFormData((prev) => ({
        ...prev,
        metadataFilePath: "",
      }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Conferences", href: "/conferences" },
          { label: "New Conference" },
        ]}
      />

      <div className="mb-8">
        <PageTitle title="Create New Conference" />
        <PageSubTitle text="Add a new conference and submission details" />
      </div>

      <div className="relative rounded-lg border border-border bg-card shadow-md p-6">
        <LoadingOverlay
          visible={createConferenceMutation.isPending || uploading}
        />
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="text-red-600">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-2 text-heading">
              Conference Title *
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Episteme Conference 2027"
              disabled={createConferenceMutation.isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-heading">
              Slug *
            </label>
            <Input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="e.g., episteme-2027"
              disabled={createConferenceMutation.isPending}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Start Date *
              </label>
              <Input
                type="date"
                name="startAt"
                value={formData.startAt}
                onChange={handleInputChange}
                disabled={createConferenceMutation.isPending}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                End Date *
              </label>
              <Input
                type="date"
                name="endAt"
                value={formData.endAt}
                onChange={handleInputChange}
                disabled={createConferenceMutation.isPending}
              />
              {formData.startAt && formData.endAt && formData.endAt < formData.startAt && (
                <p className="text-red-400 text-xs mt-1">End Date must be on or after Start Date</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Submission Start Date *
              </label>
              <Input
                type="date"
                name="submissionPeriodStartAt"
                value={formData.submissionPeriodStartAt}
                onChange={handleInputChange}
                disabled={createConferenceMutation.isPending}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Submission End Date *
              </label>
              <Input
                type="date"
                name="submissionPeriodEndAt"
                value={formData.submissionPeriodEndAt}
                onChange={handleInputChange}
                disabled={createConferenceMutation.isPending}
              />
              {formData.submissionPeriodStartAt && formData.submissionPeriodEndAt && formData.submissionPeriodEndAt < formData.submissionPeriodStartAt && (
                <p className="text-red-400 text-xs mt-1">Submission End Date must be on or after Submission Start Date</p>
              )}
            </div>
          </div>

          {/* Metadata File Upload */}
          <div>
            <div className="space-y-3">
              <FileUploadField
                label="Metadata File (JSON) *"
                selectedFile={metadataFile}
                onFileSelect={handleMetadataFileChange}
                disabled={uploading || createConferenceMutation.isPending}
                accept=".json,application/json"
                helperText="Upload a JSON file containing conference metadata"
                uploadedFile={uploadedMetadataFile}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-heading">
              Status *
            </label>
            <Select
              value={formData.status.toString()}
              onValueChange={handleStatusChange}
              disabled={createConferenceMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ConferenceStatus.INACTIVE.toString()}>
                  Inactive
                </SelectItem>
                <SelectItem value={ConferenceStatus.ACTIVE.toString()}>
                  Active
                </SelectItem>
                <SelectItem value={ConferenceStatus.FINISHED.toString()}>
                  Finished
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/conferences")}
              disabled={createConferenceMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                createConferenceMutation.isPending ||
                !formData.title.trim() ||
                !formData.slug.trim() ||
                !formData.startAt ||
                !formData.endAt ||
                !formData.submissionPeriodStartAt ||
                !formData.submissionPeriodEndAt ||
                !formData.metadataFilePath ||
                formData.status === undefined ||
                formData.status === null ||
                (!!formData.startAt && !!formData.endAt && formData.endAt < formData.startAt) ||
                (!!formData.submissionPeriodStartAt && !!formData.submissionPeriodEndAt && formData.submissionPeriodEndAt < formData.submissionPeriodStartAt)
              }
            >
              {createConferenceMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
