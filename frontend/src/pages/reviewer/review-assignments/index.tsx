import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Info } from "lucide-react";
import { useMyReviewAssignments } from "@/hooks/useReviewAssignments";
import type { ReviewAssignment } from "@/models/reviewAssignment";
import {
  ReviewAssignmentStatus,
  ContentSubmissionStatus,
} from "@/models/reviewAssignment";
import { ConferenceStatus } from "@/models/conference";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageTitle from "@/components/common/PageTitle";
import PageSubTitle from "@/components/common/PageSubTitle";
import { getReviewAssignmentStatusBadge } from "@/components/common/ReviewAssignmentStatusBadge";
import { getSubmissionStatusBadge } from "@/components/common/SubmissionStatusBadge";
import { getConferenceStatusBadge } from "@/components/common/ConferenceStatusBadge";
import { formatDateTime } from "@/utils/dateFormatter";
import { ReviewAssignmentStatusUpdateModal } from "@/components/reviewAssignment/ReviewAssignmentStatusUpdateModal";

const REVIEWER_ALLOWED_STATUSES = [
  ReviewAssignmentStatus.ACCEPTED,
  ReviewAssignmentStatus.DECLINED,
];

function canReviewerUpdateStatus(assignment: ReviewAssignment): boolean {
  const isStatusUpdatable =
    assignment.assignmentStatus === ReviewAssignmentStatus.ASSIGNED ||
    assignment.assignmentStatus === ReviewAssignmentStatus.ACCEPTED ||
    assignment.assignmentStatus === ReviewAssignmentStatus.DECLINED;

  const isSubmissionEligible =
    assignment.submissionStatus === ContentSubmissionStatus.PENDING_APPROVAL ||
    assignment.submissionStatus === ContentSubmissionStatus.RETURNED;

  const isConferenceActive =
    assignment.conferenceStatus === ConferenceStatus.ACTIVE;

  return isStatusUpdatable && isSubmissionEligible && isConferenceActive;
}

export default function MyReviewAssignments() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<ReviewAssignment | null>(null);

  const {
    data: response,
    isLoading,
    error,
  } = useMyReviewAssignments({
    page,
    limit: pageSize,
  });

  const assignments = response?.data || [];
  const total = response?.total || 0;
  const currentPage = page;
  const totalPages = Math.ceil(total / pageSize);

  const handleOpenStatusModal = useCallback(
    (assignment: ReviewAssignment) => {
      setSelectedAssignment(assignment);
      setIsStatusModalOpen(true);
    },
    [],
  );

  const handleCloseStatusModal = useCallback(() => {
    setIsStatusModalOpen(false);
    setSelectedAssignment(null);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

  const columns: ColumnDef<ReviewAssignment>[] = useMemo(
    () => [
      {
        accessorKey: "submissionTitle",
        header: "Submission Title",
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("submissionTitle")}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "submissionStatus",
        header: "Submission Status",
        cell: ({ row }) => (
          <div className="flex place-self-center">
            {getSubmissionStatusBadge(
              row.getValue("submissionStatus") as number,
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "conferenceTitle",
        header: "Conference",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.getValue("conferenceTitle")}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "conferenceStatus",
        header: "Conference Status",
        cell: ({ row }) => (
          <div className="flex place-self-center">
            {getConferenceStatusBadge(
              row.getValue("conferenceStatus") as number,
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        id: "assignedBy",
        header: "Assigned By",
        cell: ({ row }) => (
          <div className="text-sm">
            <div>
              {row.original.assignedByFirstName}{" "}
              {row.original.assignedByLastName}
            </div>
            <div className="text-muted-foreground text-xs">
              {row.original.assignedByEmail}
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "assignmentStatus",
        header: "Assignment Status",
        cell: ({ row }) => (
          <div className="flex place-self-center">
            {getReviewAssignmentStatusBadge(
              row.getValue("assignmentStatus") as number,
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "assignedAt",
        header: "Assigned At",
        cell: ({ row }) => (
          <span className="text-sm">
            {formatDateTime(row.getValue("assignedAt") as string)}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: "submitter",
        header: "Submitter",
        cell: ({ row }) => (
          <div className="text-sm">
            <div>
              {row.original.ownerFirstName} {row.original.ownerLastName}
            </div>
            <div className="text-muted-foreground text-xs">
              {row.original.ownerEmail}
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const assignment = row.original;

          return (
            <div className="flex gap-4 place-self-center">
              <Link
                to={`/submissions/${assignment.submissionId}`}
                title="View Submission"
              >
                <Eye className="size-4 text-foreground hover:text-foreground/80 cursor-pointer" />
              </Link>

              <div
                onClick={() => handleOpenStatusModal(assignment)}
                title="Assignment Details"
              >
                <Info className="size-4 text-foreground hover:text-foreground/80 cursor-pointer" />
              </div>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [handleOpenStatusModal],
  );

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "My Review Assignments", href: "/review-assignments/me" },
        ]}
      />
      <div className="mb-6">
        <PageTitle title="My Review Assignments" />
        <PageSubTitle text="View submissions assigned to you for review" />
      </div>

      <div className="flex flex-col gap-4">
        <DataTable
          columns={columns}
          data={assignments}
          isLoading={isLoading}
          error={error ? (error as Error).message : null}
          pageSize={pageSize}
          enableSearch
          searchPlaceholder="Filter assignments"
        />

        {!isLoading && !error && total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      <ReviewAssignmentStatusUpdateModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        selectedAssignment={selectedAssignment}
        onClose={handleCloseStatusModal}
        allowedStatuses={REVIEWER_ALLOWED_STATUSES}
        canUpdateStatus={
          selectedAssignment
            ? canReviewerUpdateStatus(selectedAssignment)
            : false
        }
        mode="reviewer"
      />
    </div>
  );
}
