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
import { ActivityStatus } from "@/models/activity";
import { useCreateActivityMutation } from "@/hooks/useActivities";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageTitle from "@/components/common/PageTitle";
import PageSubTitle from "@/components/common/PageSubTitle";
import { fileService } from "@/services/fileService";
import { FileTypeEnum } from "@/models/file";
import { FileText, Upload } from "lucide-react";

export default function NewActivity() {
  const navigate = useNavigate();
  const createActivityMutation = useCreateActivityMutation();
  const [error, setError] = useState<string | null>(null);
  const [metadataFile, setMetadataFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    metadataFilePath: "",
    status: ActivityStatus.DRAFT,
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

    createActivityMutation.mutate(
      {
        title: formData.title,
        metadataFilePath: formData.metadataFilePath,
        status: formData.status,
      },
      {
        onSuccess: () => {
          navigate("/activities");
        },
        onError: (err: any) => {
          setError(
            err instanceof Error ? err.message : "Failed to create activity",
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

  const handleMetadataFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
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
      } else {
        setError("Failed to upload file");
        setMetadataFile(null);
      }
    } catch (error) {
      console.error("Metadata file upload error:", error);
      setError("Failed to upload metadata file");
      setMetadataFile(null);
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
          { label: "Activities", href: "/activities" },
          { label: "New Activity" },
        ]}
      />

      <div className="mb-8">
        <PageTitle title="Create New Activity" />
        <PageSubTitle text="Add a new activity with metadata configuration" />
      </div>

      <div className="rounded-lg border border-border bg-card shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="text-red-600">{error}</div>}

          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium mb-2 text-heading">
              Activity Title *
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Episteme Conference 2"
              disabled={createActivityMutation.isPending}
              required
            />
          </div>

          {/* Metadata File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2 text-heading">
              Metadata File (JSON) *
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label
                  htmlFor="metadata-file"
                  className={`flex items-center gap-2 px-4 py-2 border border-accent rounded cursor-pointer hover:bg-accent/10 transition-colors ${
                    uploading || createActivityMutation.isPending
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">
                    {uploading ? "Uploading..." : "Choose JSON File"}
                  </span>
                </label>
                <input
                  id="metadata-file"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleMetadataFileChange}
                  disabled={uploading || createActivityMutation.isPending}
                  className="hidden"
                />
              </div>

              {metadataFile && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    {metadataFile.name}
                  </span>
                  {formData.metadataFilePath && (
                    <span className="text-xs text-green-600 ml-auto">
                      ✓ Uploaded
                    </span>
                  )}
                </div>
              )}

              {!metadataFile && (
                <p className="text-xs text-body">
                  Upload a JSON file containing activity metadata
                </p>
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
              disabled={createActivityMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ActivityStatus.DRAFT.toString()}>
                  Draft
                </SelectItem>
                <SelectItem value={ActivityStatus.PUBLISHED.toString()}>
                  Published
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/activities")}
              disabled={createActivityMutation.isPending}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={createActivityMutation.isPending}>
              {createActivityMutation.isPending
                ? "Creating..."
                : "Create Activity"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
