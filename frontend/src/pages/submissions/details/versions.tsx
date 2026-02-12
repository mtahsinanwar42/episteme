import { useCallback, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { FileUploadField } from "@/components/common/FileUploadField";
import type { SubmissionOutletContext } from "@/pages/submissions/details";
import { SubmissionStatus, type SubmissionVersion } from "@/models/submission";
import { UserRole } from "@/models/user";
import { FileTypeEnum } from "@/models/file";
import { useSuccessToast } from "@/hooks/useSuccessToast";
import {
  useCreateSubmissionVersionMutation,
  useSubmissionVersions,
} from "@/hooks/useSubmissions";
import { fileService } from "@/services/fileService";
import { formatDateTime } from "@/utils/dateFormatter";
import type { ColumnDef } from "@tanstack/react-table";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { DownloadCloud } from "lucide-react";
import type { RootState } from "@/stores/store";

export default function SubmissionVersions() {
  const { submission, isAdmin } =
    useOutletContext<SubmissionOutletContext>();
  const { showSuccessToast } = useSuccessToast();
  const currentUser = useSelector((state: RootState) => state?.auth?.user);
  const currentRoles = currentUser?.roles ?? [];
  const isUser = currentRoles.includes(UserRole.USER);
  const submissionOwnerId = (submission as typeof submission & { ownerUsrId?: string | number })
    ?.ownerUserId
    ?? (submission as typeof submission & { ownerUsrId?: string | number })?.ownerUsrId;
  const isSubmissionOwner =
    submissionOwnerId != null && Number(submissionOwnerId) === Number(currentUser?.id);

  const submissionId = submission.submissionId ?? submission.id;

  const { data, isLoading, isError, error } =
    useSubmissionVersions(submissionId);

  const createVersionMutation = useCreateSubmissionVersionMutation(
    submissionId ?? "",
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [changeLog, setChangeLog] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedSubmissionFile, setUploadedSubmissionFile] = useState<{
    name: string;
    size: number;
    storageKey: string;
  } | null>(null);

  const versions = useMemo(() => {
    const list = data?.data ?? [];
    const toNumber = (value?: number | string) => {
      if (typeof value === "number") return value;
      if (!value) return 0;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    return [...list].sort(
      (a, b) => toNumber(b.versionNo) - toNumber(a.versionNo),
    );
  }, [data]);

  const canUploadByRole = isAdmin || (isUser && isSubmissionOwner);
  const isAllowedStatus =
    submission.status === SubmissionStatus.PENDING_APPROVAL ||
    submission.status === SubmissionStatus.RETURNED;
  const canUpload = canUploadByRole && isAllowedStatus;

  const isSubmitting = createVersionMutation.isPending || uploading;

  const resetForm = () => {
    setChangeLog("");
    setSubmissionFile(null);
    setUploadedSubmissionFile(null);
    setErrorMessage(null);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmissionFileChange = async (file: File | null) => {
    if (!file) return;

    setSubmissionFile(file);
    setUploading(true);
    setErrorMessage(null);

    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append("file", file);

      const fileUploadResponse = await fileService.uploadFile(
        FileTypeEnum.SUBMISSIONS,
        formDataToUpload,
      );

      if (
        fileUploadResponse.success &&
        fileUploadResponse.data.file.storageKey
      ) {
        setUploadedSubmissionFile({
          name: fileUploadResponse.data.file.name,
          size: fileUploadResponse.data.file.size,
          storageKey: fileUploadResponse.data.file.storageKey,
        });
      } else {
        setErrorMessage("Failed to upload submission file");
        setSubmissionFile(null);
        setUploadedSubmissionFile(null);
      }
    } catch (uploadError) {
      console.error("Submission version file upload error:", uploadError);
      setErrorMessage("Failed to upload submission file");
      setSubmissionFile(null);
      setUploadedSubmissionFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = useCallback(async (filePath?: string) => {
    if (!filePath) return;
    await fileService.downloadFile(filePath);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!canUpload) {
      setErrorMessage("You do not have permission to add a new version.");
      return;
    }

    if (!uploadedSubmissionFile?.storageKey) {
      setErrorMessage("Submission file is required");
      return;
    }

    createVersionMutation.mutate(
      {
        contentFilePath: uploadedSubmissionFile.storageKey,
        message: changeLog.trim() || undefined,
      },
      {
        onSuccess: () => {
          showSuccessToast("New version uploaded successfully.");
          handleCloseModal();
        },
        onError: (err: unknown) => {
          setErrorMessage(
            err instanceof Error ? err.message : "Failed to upload new version",
          );
        },
      },
    );
  };

  const renderUploader = useCallback((version: SubmissionVersion) => {
    const uploader = version.uploader;
    if (!uploader) return "-";

    const fullName = [uploader.firstName, uploader.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return (
      <div className="text-sm">
        <div>{fullName || uploader.email || "-"}</div>
        {uploader.email && <div className="text-xs">{uploader.email}</div>}
      </div>
    );
  }, []);

  const columns = useMemo<ColumnDef<SubmissionVersion>[]>(() => {
    const baseColumns: ColumnDef<SubmissionVersion>[] = [
      {
        accessorKey: "versionNo",
        header: "Version No",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.versionNo ?? "-"}</span>
        ),
      },
    ];

    baseColumns.push(
      {
        accessorKey: "changeLog",
        header: "Change Log / Notes",
        cell: ({ row }) => row.original.changeLog || "-",
        enableSorting: false,
      },
      {
        accessorKey: "uploader",
        header: "Uploader",
        cell: ({ row }) => renderUploader(row.original),
        enableSorting: false,
      },
      {
        accessorKey: "file",
        header: "File",
        cell: ({ row }) =>
          row.original.file?.storageKey ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                aria-label="Download publication"
                onClick={() => handleDownload(row.original.file?.storageKey)}
              >
                <DownloadCloud className="w-4 h-4" />
              </Button>

              <div className="max-w-42 truncate">
                {row.original.file?.name || "Download"}
              </div>
            </div>
          ) : (
            "-"
          ),
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
    );

    return baseColumns;
  }, [handleDownload, renderUploader]);

  return (
    <div className="relative rounded-lg shadow-small border border-border">
      <div className="p-4 gradient-card shadow-sm flex justify-between items-center">
        <h3 className="font-semibold">Versions</h3>
      </div>

      <LoadingOverlay visible={isLoading} />

      {!isLoading && !isError && versions.length === 0 && (
        <div className="mt-6 text-sm text-muted-foreground">
          No versions available.
        </div>
      )}

      {isError && (
        <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Failed to load submission versions."}
        </div>
      )}

      <div className="p-6">
        {!isError && versions.length > 0 && (
          <div>
            <DataTable
              columns={columns}
              data={versions}
              isLoading={isLoading}
              error={error ? (error as Error).message : null}
            />
          </div>
        )}

        {canUpload && (
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setIsModalOpen(true)} disabled={isLoading}>
              Add New Version
            </Button>
          </div>
        )}
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) =>
          open ? setIsModalOpen(true) : handleCloseModal()
        }
      >
        <DialogContent onClose={handleCloseModal}>
          <DialogHeader>
            <DialogTitle>Add New Version</DialogTitle>
          </DialogHeader>

          <DialogBody>
            <LoadingOverlay visible={createVersionMutation.isPending} />

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="text-sm text-destructive">{errorMessage}</div>
              )}

              <FileUploadField
                label="Submission File *"
                selectedFile={submissionFile}
                onFileSelect={handleSubmissionFileChange}
                disabled={isSubmitting}
                helperText="Upload the updated submission file"
                uploadedFile={uploadedSubmissionFile}
                accept=".docx,.pdf"
              />

              <div className="flex flex-col space-y-2">
                <label htmlFor="changeLog" className="text-sm font-medium">
                  Change Log / Notes
                </label>
                <textarea
                  id="changeLog"
                  name="changeLog"
                  value={changeLog}
                  onChange={(event) => setChangeLog(event.target.value)}
                  rows={4}
                  className="w-full ps-3 pe-3 py-2.5 text-heading text-sm rounded-lg border border-accent focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-body"
                  placeholder="Add a short note about this version"
                  disabled={isSubmitting}
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Uploading..." : "Upload Version"}
                </Button>
              </div>
            </form>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
