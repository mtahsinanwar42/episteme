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
import { AnnouncementStatus } from "@/models/announcement";
import { useCreateAnnouncementMutation } from "@/hooks/useAnnouncements";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageTitle from "@/components/common/PageTitle";
import PageSubTitle from "@/components/common/PageSubTitle";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { fileService } from "@/services/fileService";
import { FileTypeEnum } from "@/models/file";
import { FileUploadField } from "@/components/common/FileUploadField";
import { useSuccessToast } from "@/hooks/useSuccessToast";

export default function NewAnnouncement() {
  const navigate = useNavigate();
  const createAnnouncementMutation = useCreateAnnouncementMutation();
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
    metadataFilePath: "",
    status: AnnouncementStatus.UPCOMING,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.metadataFilePath) {
      setError("Metadata file is required");
      return;
    }

    setError(null);

    createAnnouncementMutation.mutate(
      {
        title: formData.title,
        metadataFilePath: formData.metadataFilePath,
        status: formData.status,
      },
      {
        onSuccess: () => {
          showSuccessToast("Announcement created successfully.");
          navigate("/announcements");
        },
        onError: (err: any) => {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to create announcement",
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

    // Validate file type (JSON only)
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
    } catch (error) {
      console.error("Metadata file upload error:", error);
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
          { label: "Announcements", href: "/announcements" },
          { label: "New Announcement" },
        ]}
      />

      <div className="mb-8">
        <PageTitle title="Create New Announcement" />
        <PageSubTitle text="Add a new announcement with metadata configuration" />
      </div>

      <div className="relative rounded-lg border border-border bg-card shadow-md p-6">
        <LoadingOverlay
          visible={createAnnouncementMutation.isPending || uploading}
        />
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="text-red-600">{error}</div>}

          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium mb-2 text-heading">
              Announcement Title *
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Important System Update"
              disabled={createAnnouncementMutation.isPending}
            />
          </div>

          {/* Metadata File Upload */}
          <div>
            <div className="space-y-3">
              <FileUploadField
                label="Metadata File (JSON) *"
                selectedFile={metadataFile}
                onFileSelect={handleMetadataFileChange}
                disabled={uploading || createAnnouncementMutation.isPending}
                accept=".json,application/json"
                helperText="Upload a JSON file containing announcement metadata"
                uploadedFile={uploadedMetadataFile}
              />
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
              disabled={createAnnouncementMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AnnouncementStatus.UPCOMING.toString()}>
                  Upcoming
                </SelectItem>
                <SelectItem value={AnnouncementStatus.ONGOING.toString()}>
                  Ongoing
                </SelectItem>
                <SelectItem value={AnnouncementStatus.COMPLETED.toString()}>
                  Completed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/announcements")}
              disabled={createAnnouncementMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                createAnnouncementMutation.isPending ||
                !formData.title.trim() ||
                !formData.metadataFilePath ||
                formData.status === undefined ||
                formData.status === null
              }
            >
              {createAnnouncementMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
