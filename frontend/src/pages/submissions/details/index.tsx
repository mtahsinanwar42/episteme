import { useState } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  useParams,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, ExternalLink, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { useSubmissionById } from "@/hooks/useSubmissions";
import { useSearchReviewAssignments } from "@/hooks/useReviewAssignments";
import PageTitle from "@/components/common/PageTitle";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { cn } from "@/lib/utils";
import type { RootState } from "@/stores/store";
import { UserRole } from "@/models/user";
import { SubmissionStatus, type Submission } from "@/models/submission";
import {
  ContentSubmissionStatus,
  ReviewAssignmentStatus,
  type ReviewAssignment,
} from "@/models/reviewAssignment";
import { ConferenceStatus } from "@/models/conference";
import { getConferenceStatusBadge } from "@/components/common/ConferenceStatusBadge";
import { getSubmissionStatusBadge } from "@/components/common/ResourceStatusBadge";
import { RichTextDisplay } from "@/components/common/RichTextDisplay";
import { StatusUpdateModal } from "@/components/submission/StatusUpdateModal";
import { DoiUpdateModal } from "@/components/submission/DoiUpdateModal";
import { AssignReviewerModal } from "@/components/submission/AssignReviewerModal";
import { ReviewAssignmentStatusUpdateModal } from "@/components/reviewAssignment/ReviewAssignmentStatusUpdateModal";
import { getReviewAssignmentStatusBadge } from "@/components/common/ReviewAssignmentStatusBadge";
import { isDueAtNotPassed } from "@/utils/dateFormatter";

export type SubmissionOutletContext = {
  submission: Submission;
  isAdmin: boolean;
  isReviewer: boolean;
  isReviewerNonOwner: boolean;
};

export default function SubmissionDetails() {
  const { submissionId } = useParams();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const currentUserId = useSelector((state: RootState) => state?.auth?.user?.id);
  const isUser = Boolean(currentRoles?.includes(UserRole.USER));
  const isAdmin = Boolean(currentRoles?.includes(UserRole.ADMIN));
  const isReviewer = Boolean(currentRoles?.includes(UserRole.REVIEWER));

  const { data, isLoading, isError, error } = useSubmissionById(submissionId);
  const submissionData = data?.data as Submission | undefined;
  const submissionOwnerId = (submissionData as Submission & { ownerUsrId?: string | number })
    ?.ownerUserId
    ?? (submissionData as Submission & { ownerUsrId?: string | number })?.ownerUsrId;
  const isSubmissionOwner =
    submissionOwnerId != null && Number(submissionOwnerId) === Number(currentUserId);
  const isReviewerNonOwner = isReviewer && !isAdmin && !isSubmissionOwner;
  const { data: assignmentResponse, isLoading: assignmentLoading } =
    useSearchReviewAssignments(
      { submissionId: Number(submissionId), paginate: false },
      { enabled: isReviewerNonOwner && !!submissionId && !!submissionData },
    );

  const submission = submissionData as Submission;
  const shouldUseSubmissionsBreadcrumb = isAdmin || (isUser && isSubmissionOwner);
  const hasReviewerAssignment = (assignmentResponse?.data?.length ?? 0) > 0;
  const selectedAssignment = (assignmentResponse?.data?.[0] ??
    null) as ReviewAssignment | null;

  const [isSubmissionStatusModalOpen, setIsSubmissionStatusModalOpen] =
    useState(false);
  const [isDoiModalOpen, setIsDoiModalOpen] = useState(false);
  const [isAssignReviewerModalOpen, setIsAssignReviewerModalOpen] =
    useState(false);
  const [isReviewerAssignmentModalOpen, setIsReviewerAssignmentModalOpen] =
    useState(false);

  const canUpdateStatus =
    isAdmin &&
    submission?.status !== undefined &&
    [
      SubmissionStatus.DRAFT,
      SubmissionStatus.PENDING_APPROVAL,
      SubmissionStatus.RETURNED,
    ].includes(submission.status);

  const canUpdateDoi =
    isAdmin && submission?.status === SubmissionStatus.APPROVED;
  const canAssignReviewer =
    isAdmin &&
    submission?.status !== undefined &&
    [
      SubmissionStatus.PENDING_APPROVAL,
      SubmissionStatus.RETURNED,
    ].includes(submission.status);
  const canShowAdminActions =
    isAdmin &&
    submission?.status !== undefined &&
    [
      SubmissionStatus.PENDING_APPROVAL,
      SubmissionStatus.RETURNED,
      SubmissionStatus.APPROVED,
    ].includes(submission.status);
  const reviewerAllowedStatuses = [
    ReviewAssignmentStatus.ACCEPTED,
    ReviewAssignmentStatus.DECLINED,
  ];

  const canReviewerUpdateStatus = (assignment: ReviewAssignment): boolean => {
    const isStatusUpdatable =
      assignment.assignmentStatus === ReviewAssignmentStatus.ASSIGNED ||
      assignment.assignmentStatus === ReviewAssignmentStatus.ACCEPTED ||
      assignment.assignmentStatus === ReviewAssignmentStatus.DECLINED;

    const isNotOverdue = isDueAtNotPassed(assignment.dueAt);

    const isSubmissionEligible =
      assignment.submissionStatus === ContentSubmissionStatus.PENDING_APPROVAL ||
      assignment.submissionStatus === ContentSubmissionStatus.RETURNED;

    const isConferenceActive =
      assignment.conferenceStatus === ConferenceStatus.ACTIVE;

    return isStatusUpdatable && isNotOverdue && isSubmissionEligible && isConferenceActive;
  };

  if (isLoading) {
    return (
      <div className="relative min-h-[400px]">
        <LoadingOverlay visible />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 text-destructive rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              Error Loading Submission
            </h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return <Navigate to="/404-not-found" replace />;
  }

  return (
    <div>
      <Breadcrumb
        items={[
          shouldUseSubmissionsBreadcrumb
            ? { label: "Submissions", href: "/submissions" }
            : { label: "Review Assignments", href: "/review-assignments/me" },
          {
            label: submission.formId || submission.title,
          },
        ]}
      />

      <div className="mb-6">
        <PageTitle title="Submission Details" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <div className="h-fit gradient-card">
          <nav className="">
            <NavLink
              to={`/submissions/${submission.submissionId}/details`}
              className={({ isActive }) =>
                cn(
                  "block px-4 py-3 bg-slate-900 text-sm hover:bg-accent/70 border-b border-white/20",
                  isActive ? "bg-accent/70 text-foreground" : "",
                )
              }
            >
              Details
            </NavLink>
            <NavLink
              to={`/submissions/${submission.submissionId}/messages`}
              className={({ isActive }) =>
                cn(
                  "block px-4 py-3 bg-slate-900 text-sm hover:bg-accent/70 border-b border-white/20",
                  isActive ? "bg-accent/70 text-foreground" : "",
                )
              }
            >
              Messages
            </NavLink>
            <NavLink
              to={`/submissions/${submission.submissionId}/versions`}
              className={({ isActive }) =>
                cn(
                  "block px-4 py-3 bg-slate-900 text-sm hover:bg-accent/70 border-b border-white/20",
                  isActive ? "bg-accent/70 text-foreground" : "",
                )
              }
            >
              Versions
            </NavLink>

            {isAdmin ||
            (isReviewerNonOwner && !assignmentLoading && hasReviewerAssignment) ? (
              <NavLink
                to={`/submissions/${submission.submissionId}/reviews`}
                className={({ isActive }) =>
                  cn(
                    "block px-4 py-3 bg-slate-900 text-sm hover:bg-accent/70",
                    isActive ? "bg-accent/70 text-foreground" : "",
                  )
                }
              >
                Reviews
              </NavLink>
            ) : null}
          </nav>
        </div>

        <div>
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="mb-0">{submission.title}</h1>
                  {getSubmissionStatusBadge(submission.status)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Form ID: {submission.formId || "-"}
                </div>
              </div>

              {canShowAdminActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <EllipsisVertical className="h-5 w-5" />
                      <span className="sr-only">Submission actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canUpdateStatus && (
                      <DropdownMenuItem
                        onClick={() => setIsSubmissionStatusModalOpen(true)}
                      >
                        Update Status
                      </DropdownMenuItem>
                    )}
                    {canUpdateDoi && (
                      <DropdownMenuItem onClick={() => setIsDoiModalOpen(true)}>
                        Update DOI
                      </DropdownMenuItem>
                    )}
                    {canAssignReviewer && (
                      <DropdownMenuItem
                        onClick={() => setIsAssignReviewerModalOpen(true)}
                      >
                        Assign Reviewer
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {selectedAssignment && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">
                  Review Status:
                </span>
                {getReviewAssignmentStatusBadge(
                  selectedAssignment.assignmentStatus,
                )}
                {isReviewerNonOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsReviewerAssignmentModalOpen(true)}
                    title="Assignment Details"
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span className="sr-only">Assignment details</span>
                  </Button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">Conference:</span>
              <Link
                to={`/conferences/${submission.conferenceId}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent/80 hover:underline transition-colors"
              >
                {submission.conferenceTitle || "-"}
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              {getConferenceStatusBadge(submission.conferenceStatus!)}
            </div>

            <div className="text-sm text-foreground/80 mb-4">
              Topics:{" "}
              {submission.topics && submission.topics.length > 0 ? (
                submission.topics.join(", ")
              ) : (
                <p className="text-sm text-muted-foreground">-</p>
              )}
            </div>

            {submission?.abstract && (
              <div>
                <div className="font-medium mb-2">Abstract</div>
                {submission?.abstract && (
                  <RichTextDisplay content={submission.abstract} />
                )}
              </div>
            )}
          </div>

          <div>
            <Outlet
              context={{
                submission,
                isAdmin,
                isReviewer,
                isReviewerNonOwner,
              }}
            />
          </div>
        </div>
      </div>

      {isAdmin && (
        <>
          <StatusUpdateModal
            open={isSubmissionStatusModalOpen}
            onOpenChange={setIsSubmissionStatusModalOpen}
            selectedSubmission={submission}
            onClose={() => setIsSubmissionStatusModalOpen(false)}
          />

          <DoiUpdateModal
            open={isDoiModalOpen}
            onOpenChange={setIsDoiModalOpen}
            selectedSubmission={submission}
            onClose={() => setIsDoiModalOpen(false)}
          />

          {canAssignReviewer && (
            <AssignReviewerModal
              open={isAssignReviewerModalOpen}
              onOpenChange={setIsAssignReviewerModalOpen}
              selectedSubmission={submission}
              onClose={() => setIsAssignReviewerModalOpen(false)}
            />
          )}
        </>
      )}

      <ReviewAssignmentStatusUpdateModal
        open={isReviewerAssignmentModalOpen}
        onOpenChange={setIsReviewerAssignmentModalOpen}
        selectedAssignment={selectedAssignment}
        onClose={() => setIsReviewerAssignmentModalOpen(false)}
        allowedStatuses={reviewerAllowedStatuses}
        canUpdateStatus={
          selectedAssignment ? canReviewerUpdateStatus(selectedAssignment) : false
        }
        mode="reviewer"
      />
    </div>
  );
}
