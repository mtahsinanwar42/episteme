"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BlogStatus } from "@/models/blog";
import { useUpdateBlogMutation, useBlogById } from "@/hooks/useBlogs";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageTitle from "@/components/common/PageTitle";
import PageSubTitle from "@/components/common/PageSubTitle";
import { fileService } from "@/services/fileService";
import { FileTypeEnum } from "@/models/file";
import { FileText, Upload, Loader2 } from "lucide-react";

export default function EditBlog() {
  const navigate = useNavigate();
  const { blogId } = useParams<{ blogId: string }>();
  const { data: blogData, isLoading: isLoadingBlog } = useBlogById(blogId);
  const updateBlogMutation = useUpdateBlogMutation(blogId!);
  const [error, setError] = useState<string | null>(null);
  const [metadataFile, setMetadataFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    metadataFilePath: "",
    status: BlogStatus.PUBLISHED.toString(),
  });

  // Pre-fill form with existing blog data
  useEffect(() => {
    if (blogData?.data) {
      setFormData((prev) => ({
        ...prev,
        title: blogData.data.title,
        metadataFilePath: blogData.data.metadataFilePath || "",
        status: blogData.data.status.toString(),
      }));
    }
  }, [blogData]);

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

    updateBlogMutation.mutate(
      {
        title: formData.title,
        metadataFilePath: formData.metadataFilePath,
        status: Number(formData.status),
      },
      {
        onSuccess: () => {
          navigate("/blogs");
        },
        onError: (err: any) => {
          setError(
            err instanceof Error ? err.message : "Failed to update blog",
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

  if (isLoadingBlog) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!blogData?.data) {
    return <div className="text-center text-red-600">Blog not found</div>;
  }

  return (
    <div>
      <Breadcrumb
        items={[{ label: "Blogs", href: "/blogs" }, { label: "Edit Blog" }]}
      />

      <div className="mb-8">
        <PageTitle title="Edit Blog" />
        <PageSubTitle text="Update blog post details and metadata configuration" />
      </div>

      <div className="rounded-lg border border-border bg-card shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="text-red-600">{error}</div>}

          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium mb-2 text-heading">
              Blog Title *
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Introduction to Research Methods"
              disabled={updateBlogMutation.isPending}
            />
          </div>

          {/* Metadata File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2 text-heading">
              Metadata File (JSON) *
            </label>
            <div className="space-y-3">
              {/* Current file info */}
              {formData.metadataFilePath && !metadataFile && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Current: {formData.metadataFilePath}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4">
                <label
                  htmlFor="metadata-file"
                  className={`flex items-center gap-2 px-4 py-2 border border-accent rounded cursor-pointer hover:bg-accent/10 transition-colors ${
                    uploading || updateBlogMutation.isPending
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">
                    {uploading ? "Uploading..." : "Choose New JSON File"}
                  </span>
                </label>
                <input
                  id="metadata-file"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleMetadataFileChange}
                  disabled={uploading || updateBlogMutation.isPending}
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

              {!metadataFile && !formData.metadataFilePath && (
                <p className="text-xs text-body">
                  Upload a JSON file containing blog metadata
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
              disabled={updateBlogMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BlogStatus.DRAFT.toString()}>
                  Draft
                </SelectItem>
                <SelectItem value={BlogStatus.PUBLISHED.toString()}>
                  Published
                </SelectItem>
                <SelectItem value={BlogStatus.DELETED.toString()}>
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
              onClick={() => navigate("/blogs")}
              disabled={updateBlogMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                updateBlogMutation.isPending ||
                !formData.title.trim() ||
                !formData.metadataFilePath ||
                formData.status === undefined ||
                formData.status === null
              }
            >
              {updateBlogMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
