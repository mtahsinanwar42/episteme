import { useCallback, useMemo, useState } from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploadField } from "@/components/common/FileUploadField";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import type { SubmissionOutletContext } from "@/pages/submissions/details";
import {
  ReviewRecommendation,
  ReviewRecommendationLabel,
  SubmissionStatus,
  type SubmissionReview,
} from "@/models/submission";
import { FileTypeEnum } from "@/models/file";
import { useSuccessToast } from "@/hooks/useSuccessToast";
import {
  useCreateSubmissionReviewMutation,
  useCreateSubmissionVersionMutation,
  useSubmissionReviews,
} from "@/hooks/useSubmissions";
import { useSearchReviewAssignments } from "@/hooks/useReviewAssignments";
import { ReviewAssignmentStatus } from "@/models/reviewAssignment";
import { fileService } from "@/services/fileService";
import { formatDateTime, isDueAtNotPassed } from "@/utils/dateFormatter";
import type { ColumnDef } from "@tanstack/react-table";
import { DownloadCloud, Info } from "lucide-react";

export default function SubmissionReviews() {
  const { submission, isAdmin, isReviewerNonOwner } =
    useOutletContext<SubmissionOutletContext>();
  const { showSuccessToast } = useSuccessToast();

  const submissionId = submission.submissionId ?? submission.id;

  const {
    data: assignmentsData,
    isLoading: assignmentsLoading,
    refetch: refetchReviewAssignments,
  } =
    useSearchReviewAssignments(
    { submissionId: Number(submissionId), paginate: false },
    { enabled: isReviewerNonOwner && !!submissionId },
    );

  const hasBaseReviewAccess = isAdmin || isReviewerNonOwner;
  const hasReviewerAssignment = useMemo(
    () => (assignmentsData?.data?.length ?? 0) > 0,
    [assignmentsData],
  );
  const canFetchReviews =
    !!submissionId &&
    hasBaseReviewAccess &&
    (isAdmin || (!assignmentsLoading && hasReviewerAssignment));

  const { data, isLoading, isError, error } = useSubmissionReviews(submissionId, {
    enabled: canFetchReviews,
  });

  const createVersionMutation = useCreateSubmissionVersionMutation(
    submissionId ?? "",
  );
  const createReviewMutation = useCreateSubmissionReviewMutation(
    submissionId ?? "",
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<SubmissionReview | null>(
    null,
  );
  const [changeLog, setChangeLog] = useState("");
  const [comment, setComment] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedSubmissionFile, setUploadedSubmissionFile] = useState<{
    name: string;
    size: number;
    storageKey: string;
  } | null>(null);

  const reviews = useMemo(() => {
    const list = data?.data ?? [];
    return [...list].sort((a, b) => {
      const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return right - left;
    });
  }, [data]);

  const isAllowedStatus =
    submission.status === SubmissionStatus.PENDING_APPROVAL ||
    submission.status === SubmissionStatus.RETURNED;

  const hasAcceptedAssignment = useMemo(() => {
    if (!isReviewerNonOwner) return false;
    const assignments = assignmentsData?.data ?? [];
    return assignments.some(
      (assignment) =>
        Number(assignment.submissionId) === Number(submissionId) &&
        assignment.assignmentStatus === ReviewAssignmentStatus.ACCEPTED &&
        isDueAtNotPassed(assignment.dueAt),
    );
  }, [isReviewerNonOwner, assignmentsData, submissionId]);
  const hasReviewForCurrentSubmissionVersion = useMemo(() => {
    if (!isReviewerNonOwner) return false;

    const currentVersionId = submission.currentContentSubmissionVersionId;
    if (currentVersionId == null) return false;

    return reviews.some(
      (review) =>
        review.version?.versionId != null &&
        Number(review.version.versionId) === Number(currentVersionId),
    );
  }, [isReviewerNonOwner, reviews, submission.currentContentSubmissionVersionId]);

  const canAddReview =
    isReviewerNonOwner &&
    isAllowedStatus &&
    hasAcceptedAssignment &&
    !hasReviewForCurrentSubmissionVersion;
  const reviewerAlreadyReviewedInfoMessage =
    !isAdmin && isReviewerNonOwner && hasReviewForCurrentSubmissionVersion
      ? "You already submitted a review for the current submission version. Add Review will be available after a new version is uploaded."
      : null;
  const statusNotAllowedInfoMessage =
    !isAdmin && isReviewerNonOwner && !isAllowedStatus
      ? "Review submission is only available for submissions with status Pending Approval or Returned."
      : null;
  const reviewerNotAcceptedInfoMessage =
    !reviewerAlreadyReviewedInfoMessage &&
    !statusNotAllowedInfoMessage &&
    !isAdmin &&
    isReviewerNonOwner &&
    hasReviewerAssignment &&
    !hasAcceptedAssignment
      ? "You cannot submit a review unless the assignment status is Accepted and not overdue."
      : null;

  const isSubmitting =
    createVersionMutation.isPending ||
    createReviewMutation.isPending ||
    uploading;
  const isReviewSectionLoading = isLoading || (isReviewerNonOwner && assignmentsLoading);
  const isRecommendationValid = recommendation.trim().length > 0;
  const isChangeLogDependencyValid =
    !changeLog.trim() || !!uploadedSubmissionFile?.storageKey;
  const canSubmitReview =
    isRecommendationValid &&
    isChangeLogDependencyValid &&
    !isSubmitting;

  const resetForm = () => {
    setChangeLog("");
    setComment("");
    setRecommendation("");
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
    if (!file) {
      setSubmissionFile(null);
      setUploadedSubmissionFile(null);
      return;
    }

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
      console.error("Review file upload error:", uploadError);
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!isRecommendationValid) {
      setErrorMessage("Recommendation is required");
      return;
    }

    if (!isChangeLogDependencyValid) {
      setErrorMessage("Upload a submission file to add notes");
      return;
    }

    try {
      let reviewerContentSubmissionVersionId: string | number | undefined;

      if (uploadedSubmissionFile?.storageKey) {
        const versionResponse = await createVersionMutation.mutateAsync({
          contentFilePath: uploadedSubmissionFile.storageKey,
          message: changeLog.trim() || undefined,
        });

        const responseData = (versionResponse as { data?: any })?.data;
        reviewerContentSubmissionVersionId =
          responseData?.versionId ?? responseData?.id;
      }

      await createReviewMutation.mutateAsync({
        recommendation: Number(recommendation),
        comment: comment.trim() || undefined,
        reviewerContentSubmissionVersionId,
      });
      await refetchReviewAssignments();

      showSuccessToast("Review submitted successfully.");
      handleCloseModal();
    } catch (submitError) {
      setErrorMessage(
        submitError instanceof Error
          ? submitError.message
          : "Failed to submit review",
      );
    }
  };

  const renderReviewer = useCallback((review: SubmissionReview) => {
    const reviewer = review.reviewer;
    if (!reviewer) return "-";

    const fullName = [reviewer.firstName, reviewer.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return (
      <div className="text-sm">
        <div>{fullName || reviewer.email || "-"}</div>
        {reviewer.email && <div className="text-xs">{reviewer.email}</div>}
      </div>
    );
  }, []);

  const columns = useMemo<ColumnDef<SubmissionReview>[]>(() => {
    const baseColumns: ColumnDef<SubmissionReview>[] = [];

    if (isAdmin) {
      baseColumns.push({
        accessorKey: "reviewer",
        header: "Reviewer",
        cell: ({ row }) => renderReviewer(row.original),
        enableSorting: false,
      });
    }

    baseColumns.push(
      {
        accessorKey: "version",
        header: "Reviewed Version",
        cell: ({ row }) =>
          row.original.version?.file?.storageKey ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                aria-label="Download reviewed version"
                onClick={() =>
                  handleDownload(row.original.version?.file?.storageKey)
                }
              >
                <DownloadCloud className="w-4 h-4" />
              </Button>

              <div className="max-w-42 truncate">
                {row.original.version?.file?.name || "Download"}
              </div>
            </div>
          ) : (
            "-"
          ),
        enableSorting: false,
      },
      {
        accessorKey: "reviewerVersion",
        header: "Reviewer Version",
        cell: ({ row }) =>
          row.original.reviewerVersion?.file?.storageKey ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                aria-label="Download reviewer version"
                onClick={() =>
                  handleDownload(row.original.reviewerVersion?.file?.storageKey)
                }
              >
                <DownloadCloud className="w-4 h-4" />
              </Button>

              <div className="max-w-42 truncate">
                {row.original.reviewerVersion?.file?.name || "Download"}
              </div>
            </div>
          ) : (
            "-"
          ),
        enableSorting: false,
      },
      {
        accessorKey: "recommendation",
        header: "Recommendation",
        cell: ({ row }) => {
          const recommendation = row.original.recommendation;
          if (!recommendation) return "-";

          const label = ReviewRecommendationLabel[recommendation] || "-";
          const variant =
            recommendation === ReviewRecommendation.ACCEPTED
              ? "default"
              : recommendation === ReviewRecommendation.REJECTED
                ? "destructive"
                : "secondary";

          return <Badge variant={variant}>{label}</Badge>;
        },
        enableSorting: false,
      },
      {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => (
          <div
            onClick={() => {
              setSelectedReview(row.original);
              setIsDetailsModalOpen(true);
            }}
            title="Review Details"
            className="flex place-self-center"
          >
            <Info className="size-4 text-foreground hover:text-foreground/80 cursor-pointer" />
          </div>
        ),
        enableSorting: false,
      },
    );

    return baseColumns;
  }, [handleDownload, isAdmin, renderReviewer]);

  if (!isAdmin && !isReviewerNonOwner) {
    return <Navigate to={`/submissions/${submissionId}/details`} replace />;
  }
  if (!isAdmin && isReviewerNonOwner && !assignmentsLoading && !hasReviewerAssignment) {
    return (
      <div className="rounded-lg border border-border p-6">
        <p className="text-sm text-muted-foreground">
          You do not have access to view reviews for this submission.
        </p>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg shadow-small border border-border">
      <div className="p-4 gradient-card shadow-sm flex justify-between items-center">
        <h3 className="font-semibold">Reviews</h3>
      </div>

      {(statusNotAllowedInfoMessage || reviewerAlreadyReviewedInfoMessage || reviewerNotAcceptedInfoMessage) && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-950/50 border-b border-blue-800/50 text-blue-300 text-xs">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>{statusNotAllowedInfoMessage || reviewerAlreadyReviewedInfoMessage || reviewerNotAcceptedInfoMessage}</span>
        </div>
      )}

      <LoadingOverlay visible={isReviewSectionLoading} />

      {isError && (
        <div className="mt-4 rounded-md border border-red-500/30 bg-red-200/40 text-orange-700 p-4 text-sm">
          {error instanceof Error
            ? error.message
            : "Failed to load submission reviews."}
        </div>
      )}

      <div className="p-6">
        {!isReviewSectionLoading && !isError && reviews.length === 0 && (
          <div className="text-sm text-center">No reviews available.</div>
        )}

        {!isError && reviews.length > 0 && (
          <div>
            <DataTable
              columns={columns}
              data={reviews}
              isLoading={isReviewSectionLoading}
              error={error ? (error as Error).message : null}
            />
          </div>
        )}

        {canAddReview && (
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setIsModalOpen(true)} disabled={isLoading}>
              Add Review
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
            <DialogTitle>Add Review</DialogTitle>
          </DialogHeader>

          <DialogBody>
            <LoadingOverlay visible={isSubmitting} />

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="text-sm text-orange-700">{errorMessage}</div>
              )}

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Recommendation *</label>
                <Select
                  value={recommendation}
                  onValueChange={setRecommendation}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recommendation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(ReviewRecommendation.ACCEPTED)}>
                      Accepted
                    </SelectItem>
                    <SelectItem value={String(ReviewRecommendation.REJECTED)}>
                      Rejected
                    </SelectItem>
                    <SelectItem
                      value={String(ReviewRecommendation.NEEDS_REVISION)}
                    >
                      Needs Revision
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="comment" className="text-sm font-medium">
                  Comments (optional)
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  className="w-full ps-3 pe-3 py-2.5 text-heading text-sm rounded-lg border border-accent focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-body"
                  placeholder="Add reviewer comments"
                  disabled={isSubmitting}
                ></textarea>
              </div>

              <FileUploadField
                label="Submission File (optional)"
                selectedFile={submissionFile}
                onFileSelect={handleSubmissionFileChange}
                disabled={isSubmitting}
                helperText="Upload the reviewed submission file"
                uploadedFile={uploadedSubmissionFile}
                accept=".docx,.pdf"
              />

              <div className="flex flex-col space-y-2">
                <label htmlFor="changeLog" className="text-sm font-medium">
                  Change Log / Notes (optional)
                </label>
                <textarea
                  id="changeLog"
                  name="changeLog"
                  value={changeLog}
                  onChange={(event) => setChangeLog(event.target.value)}
                  rows={4}
                  className="w-full ps-3 pe-3 py-2.5 text-heading text-sm rounded-lg border border-accent focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-body"
                  placeholder="Summarize the edits or review notes"
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
                <Button type="submit" disabled={!canSubmitReview}>
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </form>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDetailsModalOpen}
        onOpenChange={(open) => {
          setIsDetailsModalOpen(open);
          if (!open) {
            setSelectedReview(null);
          }
        }}
      >
        <DialogContent
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedReview(null);
          }}
        >
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-[220px_1fr] gap-2">
                <span className="text-muted-foreground">Reviewed Version No.</span>
                <span>{selectedReview?.version?.versionNo ?? "-"}</span>
              </div>
              <div className="grid grid-cols-[220px_1fr] gap-2">
                <span className="text-muted-foreground">Reviewer Version No.</span>
                <span>{selectedReview?.reviewerVersion?.versionNo ?? "-"}</span>
              </div>
              <div className="grid grid-cols-[220px_1fr] gap-2">
                <span className="text-muted-foreground">Reviewed Version Created At</span>
                <span>{formatDateTime(selectedReview?.version?.createdAt)}</span>
              </div>
              <div className="grid grid-cols-[220px_1fr] gap-2">
                <span className="text-muted-foreground">Reviewer Version Created At</span>
                <span>{formatDateTime(selectedReview?.reviewerVersion?.createdAt)}</span>
              </div>
              <div className="grid grid-cols-[220px_1fr] gap-2">
                <span className="text-muted-foreground">
                  Reviewer Version Change Log / Notes
                </span>
                <span>{selectedReview?.reviewerVersion?.changeLog || "-"}</span>
              </div>
              <div className="grid grid-cols-[220px_1fr] gap-2">
                <span className="text-muted-foreground">Comments</span>
                <span>{selectedReview?.comment || "-"}</span>
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
