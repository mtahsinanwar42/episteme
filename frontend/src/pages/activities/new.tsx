"use client";

import { useState, useEffect } from "react";
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
import type { File } from "@/models/file";
import { ActivityStatus } from "@/models/activity";
import { useFiles } from "@/hooks/useFiles";
import { useCreateActivityMutation } from "@/hooks/useActivities";

export default function NewActivity() {
  const navigate = useNavigate();
  const createActivityMutation = useCreateActivityMutation();
  const [files, setFiles] = useState<File[]>([]);
  const [fileLoading, setFileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    data: filesResponse,
    isLoading,
    error: fileResponseError,
  } = useFiles({
    sort: "-createdAt",
    paginate: true,
  });

  const [formData, setFormData] = useState({
    title: "",
    metadataFilePath: "",
    status: ActivityStatus.PUBLISHED,
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

  const handleFileChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      metadataFilePath: value,
    }));
  };

  useEffect(() => {
    try {
      if (filesResponse?.success && filesResponse.data) {
        const assetsFiles = filesResponse.data.filter((file) =>
          file.storageKey.startsWith("storage/public/assets/"),
        );
        setFiles(assetsFiles);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to load files");
    } finally {
      setFileLoading(false);
    }
  }, [filesResponse]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl text-accent font-bold mb-2">
          Create New Activity
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Add a new activity with metadata configuration
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-red-600">
              {(fileResponseError as Error).message}
            </div>
          )}

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

          {/* Metadata File Select */}
          <div>
            <label className="block text-sm font-medium mb-2 text-heading">
              Metadata File *
            </label>
            {fileLoading ? (
              <div className="p-3 border border-accent rounded bg-slate-50 dark:bg-slate-900 text-body">
                Loading files...
              </div>
            ) : (
              <Select
                value={formData.metadataFilePath}
                onValueChange={handleFileChange}
                disabled={
                  createActivityMutation.isPending || files.length === 0
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a metadata file" />
                </SelectTrigger>
                <SelectContent>
                  {files.length > 0 ? (
                    files.map((file) => (
                      <SelectItem key={file.id} value={file.storageKey}>
                        {file.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-body">
                      No files found in storage/public/assets
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-body mt-2">
              Files from: storage/public/assets/
            </p>
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
                  Draft (0)
                </SelectItem>
                <SelectItem value={ActivityStatus.PUBLISHED.toString()}>
                  Published (1)
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
