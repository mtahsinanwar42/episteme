import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileTypeEnum } from "@/models/file";
import { fileService } from "@/services/fileService";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";

export default function NewAsset() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fileService.uploadFile(
        FileTypeEnum.ASSETS,
        formData,
      );

      if (response.success && response.data.file) {
        setSuccess(true);
        setUploadedFile(response.data.file);
        setSelectedFile(null);
        // Reset form after 2 seconds
        setTimeout(() => {
          setSuccess(false);
          setUploadedFile(null);
          navigate(`/assets`);
        }, 2000);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload file";
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-accent text-3xl font-bold">Create New Asset</h1>
        <p className="text-muted-foreground">
          Upload a new file to your assets
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-md p-6">
        <div className="space-y-3">
          {/* Asset Type is fixed to ASSETS; no selection needed */}

          {/* File Upload Area */}
          <div className="flex flex-col space-y-3 max-w-lg">
            <label className="text-sm font-medium text-slate-700">
              Select File *
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="cursor-pointer hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className={`flex items-center justify-center w-full px-6 py-8 border-2 border-dashed rounded-lg transition-colors ${
                  selectedFile
                    ? "border-green-500 bg-green-50"
                    : "border-slate-300 bg-slate-50 hover:border-slate-400"
                } ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="w-8 h-8 text-slate-400" />
                  <div className="text-sm text-slate-600">
                    {selectedFile ? (
                      <div className="flex flex-col items-center space-y-1">
                        <FileText className="w-5 h-5 text-green-600" />
                        <p className="font-medium text-green-600">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium">
                          Click to select or drag and drop
                        </p>
                        <p className="text-xs text-slate-500">
                          Any file type is supported
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-md text-sm border border-red-500/30 bg-red-500/10 text-red-800 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && uploadedFile && (
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
                <p className="text-xs text-green-700">
                  Redirecting to asset details...
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate("/assets")}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleUpload}
              disabled={isUploading || !selectedFile || success}
            >
              {isUploading ? "Uploading..." : "Upload Asset"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
