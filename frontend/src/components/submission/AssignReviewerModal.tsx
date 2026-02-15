import { useState, useMemo, useRef, useEffect } from "react";
import type { Submission, SubmissionReviewer } from "@/models/submission";
import type { ReviewAssignment } from "@/models/reviewAssignment";
import { UserRole, UserStatus } from "@/models/user";
import {
  ContentSubmissionStatus,
  ReviewAssignmentStatus,
} from "@/models/reviewAssignment";
import { ConferenceStatus } from "@/models/conference";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckIcon, ChevronDownIcon, RefreshCw } from "lucide-react";
import { ReviewAssignmentStatusUpdateModal } from "@/components/reviewAssignment/ReviewAssignmentStatusUpdateModal";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { getReviewAssignmentStatusBadge } from "@/components/common/ReviewAssignmentStatusBadge";
import { useSubmissionReviewers } from "@/hooks/useSubmissions";
import { useUsers } from "@/hooks/useUsers";
import {
  useCreateReviewAssignmentMutation,
} from "@/hooks/useReviewAssignments";
import { useSuccessToast } from "@/hooks/useSuccessToast";
import {
  formatDateInputToLocalEndOfDayIso,
  formatDateTime,
  formatLocalDateForInput,
  isDateInputTodayOrFuture,
} from "@/utils/dateFormatter";
import type { ColumnDef } from "@tanstack/react-table";
import {
  getReviewAssignmentStatusLabel,
} from "@/components/common/ReviewAssignmentStatusBadge";

interface AssignReviewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSubmission: Submission | null;
  onClose: () => void;
}

export function AssignReviewerModal({
  open,
  onOpenChange,
  selectedSubmission,
  onClose,
}: AssignReviewerModalProps) {
  const getDefaultDueAt = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return formatLocalDateForInput(date);
  };

  const [selectedReviewerId, setSelectedReviewerId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [dueAt, setDueAt] = useState<string>(getDefaultDueAt());
  const [reviewerSearch, setReviewerSearch] = useState<string>("");
  const [isReviewerDropdownOpen, setIsReviewerDropdownOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedAssignmentRow, setSelectedAssignmentRow] =
    useState<SubmissionReviewer | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { showSuccessToast } = useSuccessToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsReviewerDropdownOpen(false);
        setReviewerSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isReviewerDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isReviewerDropdownOpen]);

  const submissionId =
    selectedSubmission?.submissionId ?? selectedSubmission?.id;

  const { data: reviewersData, isLoading: reviewersLoading } =
    useSubmissionReviewers(submissionId, {
      enabled: open && !!submissionId,
      paginate: false,
    });

  const { data: allReviewersResponse, isLoading: allReviewersLoading } =
    useUsers({
      roles: UserRole.REVIEWER,
      status: UserStatus.ACTIVE,
      paginate: false,
      sort: "-createdAt",
    }, {
      enabled: open,
    });

  const createAssignmentMutation = useCreateReviewAssignmentMutation();

  const ADMIN_ALLOWED_STATUSES = [
    ReviewAssignmentStatus.ASSIGNED,
    ReviewAssignmentStatus.CANCELLED,
    ReviewAssignmentStatus.DELETED,
  ];

  const assignedReviewers = useMemo(() => {
    return reviewersData?.data ?? [];
  }, [reviewersData]);

  const assignedReviewerIds = useMemo(() => {
    return new Set(assignedReviewers.map((r) => String(r.id)));
  }, [assignedReviewers]);

  const availableReviewers = useMemo(() => {
    const allReviewers = allReviewersResponse?.data ?? [];
    const ownerUserId = selectedSubmission?.ownerUserId;
    let filtered = allReviewers.filter(
      (reviewer) =>
        !assignedReviewerIds.has(String(reviewer.id)) &&
        String(reviewer.id) !== String(ownerUserId),
    );

    if (reviewerSearch.trim()) {
      const search = reviewerSearch.toLowerCase().trim();
      filtered = filtered.filter(
        (reviewer) =>
          reviewer.firstName?.toLowerCase().includes(search) ||
          reviewer.lastName?.toLowerCase().includes(search) ||
          reviewer.email?.toLowerCase().includes(search) ||
          reviewer.institution?.toLowerCase().includes(search),
      );
    }

    return filtered;
  }, [allReviewersResponse, assignedReviewerIds, reviewerSearch, selectedSubmission]);

  const selectedReviewerLabel = useMemo(() => {
    if (!selectedReviewerId) return "";
    const allReviewers = allReviewersResponse?.data ?? [];
    const reviewer = allReviewers.find((r) => String(r.id) === selectedReviewerId);
    if (!reviewer) return "";
    return `${reviewer.firstName} ${reviewer.lastName} (${reviewer.email})`;
  }, [selectedReviewerId, allReviewersResponse]);

  const isDueAtValid = useMemo(() => {
    return isDateInputTodayOrFuture(dueAt);
  }, [dueAt]);

  const handleAssignReviewer = () => {
    if (!selectedSubmission || !selectedReviewerId || !isDueAtValid) return;

    createAssignmentMutation.mutate(
      {
        contentSubmissionId: submissionId!,
        reviewerUsrId: Number(selectedReviewerId),
        assignedByNotes: notes.trim() || undefined,
        dueAt: formatDateInputToLocalEndOfDayIso(dueAt),
      },
      {
        onSuccess: () => {
          setSelectedReviewerId("");
          setNotes("");
          setDueAt(getDefaultDueAt());
          setReviewerSearch("");
          setIsReviewerDropdownOpen(false);
          showSuccessToast("Reviewer assigned successfully.");
        },
        onError: (error) => {
          console.error("Error assigning reviewer:", error);
        },
      },
    );
  };

  const handleClose = () => {
    setSelectedReviewerId("");
    setNotes("");
    setDueAt(getDefaultDueAt());
    setReviewerSearch("");
    setIsReviewerDropdownOpen(false);
    setIsStatusModalOpen(false);
    setSelectedAssignmentRow(null);
    onClose();
  };

  const canAdminUpdateStatus = (assignmentStatus?: number): boolean => {
    if (assignmentStatus == null) return false;

    const isAssignmentUpdatable =
      assignmentStatus !== ReviewAssignmentStatus.CANCELLED &&
      assignmentStatus !== ReviewAssignmentStatus.OVERDUE &&
      assignmentStatus !== ReviewAssignmentStatus.DELETED;

    const isSubmissionEligible =
      selectedSubmission?.status === ContentSubmissionStatus.PENDING_APPROVAL ||
      selectedSubmission?.status === ContentSubmissionStatus.RETURNED;

    const isConferenceActive =
      selectedSubmission?.conferenceStatus === ConferenceStatus.ACTIVE;

    return isAssignmentUpdatable && isSubmissionEligible && isConferenceActive;
  };

  const handleOpenStatusModal = (reviewer: SubmissionReviewer) => {
    setSelectedAssignmentRow(reviewer);
    setIsStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setSelectedAssignmentRow(null);
  };

  const selectedAssignmentForModal = useMemo((): ReviewAssignment | null => {
    if (!selectedAssignmentRow || !selectedSubmission) return null;
    return {
      assignmentId: Number(selectedAssignmentRow.assignmentId),
      submissionId: Number(submissionId),
      reviewerUserId: Number(selectedAssignmentRow.id),
      assignmentStatus: selectedAssignmentRow.assignmentStatus ?? 0,
      assignmentStatusUpdateNotes: selectedAssignmentRow.assignmentStatusUpdateNotes ?? null,
      assignedAt: selectedAssignmentRow.assignedAt ?? "",
      dueAt: selectedAssignmentRow.dueAt ?? "",
      assignedByUserId: Number(selectedAssignmentRow.assignedByUserId),
      assignedByNotes: selectedAssignmentRow.assignedByNotes ?? null,
      assignedByEmail: selectedAssignmentRow.assignedByEmail ?? "",
      assignedByFirstName: selectedAssignmentRow.assignedByFirstName ?? "",
      assignedByLastName: selectedAssignmentRow.assignedByLastName ?? "",
      submissionTitle: selectedSubmission.title,
      formId: selectedSubmission.formId,
      conferenceId: Number(selectedSubmission.conferenceId),
      submissionStatus: selectedSubmission.status ?? 0,
      submissionCreatedAt: selectedSubmission.createdAt ?? "",
      submissionUpdatedAt: selectedSubmission.updatedAt ?? "",
      conferenceTitle: selectedSubmission.conferenceTitle ?? "",
      conferenceStatus: selectedSubmission.conferenceStatus ?? 0,
      reviewerEmail: selectedAssignmentRow.email ?? "",
      reviewerFirstName: selectedAssignmentRow.firstName ?? "",
      reviewerLastName: selectedAssignmentRow.lastName ?? "",
      ownerEmail: selectedSubmission.ownerEmail ?? "",
      ownerFirstName: selectedSubmission.ownerFirstName ?? "",
      ownerLastName: selectedSubmission.ownerLastName ?? "",
    };
  }, [selectedAssignmentRow, selectedSubmission, submissionId]);

  const columns: ColumnDef<SubmissionReviewer>[] = [
    {
      id: "name",
      accessorFn: (row) => `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim(),
      header: "Name",
      cell: ({ row }) => {
        const firstName = row.original.firstName ?? "";
        const lastName = row.original.lastName ?? "";
        return `${firstName} ${lastName}`.trim() || "-";
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email ?? "-",
    },
    {
      accessorKey: "institution",
      header: "Institution",
      cell: ({ row }) => row.original.institution ?? "-",
    },
    {
      accessorKey: "occupation",
      header: "Occupation",
      cell: ({ row }) => row.original.occupation ?? "-",
    },
    {
      id: "assignmentStatus",
      accessorFn: (row) =>
        row.assignmentStatus != null
          ? getReviewAssignmentStatusLabel(row.assignmentStatus)
          : "",
      header: "Assignment Status",
      cell: ({ row }) => {
        const status = row.original.assignmentStatus;
        if (status === undefined || status === null) return "-";
        return getReviewAssignmentStatusBadge(status);
      },
    },
    {
      accessorKey: "assignedAt",
      header: "Assigned At",
      cell: ({ row }) => formatDateTime(row.original.assignedAt) || "-",
    },
    {
      accessorKey: "dueAt",
      header: "Due At",
      cell: ({ row }) => formatDateTime(row.original.dueAt) || "-",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div
          title="Status Update"
          onClick={() => handleOpenStatusModal(row.original)}
          className={cn(
            "place-self-center",
            !row.original.assignmentId ? "pointer-events-none opacity-50" : "cursor-pointer",
          )}
        >
          <RefreshCw className="size-4 text-foreground hover:text-foreground/80" />
        </div>
      ),
      enableSorting: false,
    },
  ];

  const isLoading = reviewersLoading || allReviewersLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="2xl">
      <DialogContent onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>Assign Reviewer</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {isLoading ? (
            <div className="relative min-h-[200px]">
              <LoadingOverlay visible />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-foreground mb-4">
                  Submission: {selectedSubmission?.title}
                </p>
                <p className="text-sm text-foreground/80 mb-4">
                  Form ID: {selectedSubmission?.formId || "-"}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="reviewer" className="text-sm font-medium">
                    Select Reviewer *
                  </label>
                  <div ref={dropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsReviewerDropdownOpen(!isReviewerDropdownOpen)}
                      className="w-full ps-3 pe-3 py-2.5 text-heading bg-transparent text-sm rounded border border-accent placeholder:text-body focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 flex items-center justify-between gap-2 transition-all h-9"
                    >
                      <span className="line-clamp-1 flex-1 text-left">
                        {selectedReviewerLabel || <span className="text-body">Select a reviewer</span>}
                      </span>
                      <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
                    </button>

                    {isReviewerDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full rounded border border-accent bg-background shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
                        <div className="p-1.5">
                          <input
                            ref={searchInputRef}
                            placeholder="Search by name, email or institution..."
                            value={reviewerSearch}
                            onChange={(e) => setReviewerSearch(e.target.value)}
                            className="w-full ps-3 pe-3 py-1.5 text-heading text-sm rounded border border-accent focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-body"
                          />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto p-1">
                          {availableReviewers.length === 0 ? (
                            <div className="py-2 px-3 text-sm text-body">
                              No reviewers found
                            </div>
                          ) : (
                            availableReviewers.map((reviewer) => {
                              const label = `${reviewer.firstName} ${reviewer.lastName} (${reviewer.email})`;
                              const isSelected = String(reviewer.id) === selectedReviewerId;
                              return (
                                <div
                                  key={reviewer.id}
                                  onClick={() => {
                                    setSelectedReviewerId(String(reviewer.id));
                                    setIsReviewerDropdownOpen(false);
                                    setReviewerSearch("");
                                  }}
                                  className={cn(
                                    "relative flex w-full cursor-pointer items-center rounded-sm py-1.5 pr-8 pl-2 text-sm select-none hover:bg-accent hover:text-accent-foreground",
                                    isSelected && "bg-accent text-accent-foreground",
                                  )}
                                >
                                  {label}
                                  {isSelected && (
                                    <span className="absolute right-2 flex size-3.5 items-center justify-center">
                                      <CheckIcon className="size-4" />
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label htmlFor="dueAt" className="text-sm font-medium">
                    Due Date *
                  </label>
                  <Input
                    id="dueAt"
                    name="dueAt"
                    type="date"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                    min={formatLocalDateForInput()}
                  />
                  {dueAt && !isDueAtValid && (
                    <span className="text-red-600 text-xs">
                      Due date must be today or a future date
                    </span>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notes for Reviewer
                  </label>
                  <Input
                    id="notes"
                    name="notes"
                    type="text"
                    placeholder="Enter notes for the reviewer (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleAssignReviewer}
                    disabled={
                      createAssignmentMutation.isPending || !selectedReviewerId || !isDueAtValid
                    }
                    className="w-full sm:w-auto"
                  >
                    {createAssignmentMutation.isPending
                      ? "Assigning..."
                      : "Assign Reviewer"}
                  </Button>
                </div>
              </div>

              {assignedReviewers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">
                    Assigned Reviewers ({assignedReviewers.length})
                  </h4>
                  <DataTable
                    columns={columns}
                    data={assignedReviewers}
                    enableSearch
                    enablePagination
                    pageSize={3}
                    searchPlaceholder="Filter assigned reviewers"
                    searchableColumnIds={[
                      "name",
                      "email",
                      "institution",
                      "occupation",
                      "assignmentStatus",
                    ]}
                  />
                </div>
              )}

              {assignedReviewers.length === 0 && !isLoading && (
                <div className="text-sm text-muted-foreground">
                  No reviewers assigned yet.
                </div>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createAssignmentMutation.isPending}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      <ReviewAssignmentStatusUpdateModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        selectedAssignment={selectedAssignmentForModal}
        onClose={handleCloseStatusModal}
        showNotes
        showSubmissionInfo={false}
        allowedStatuses={ADMIN_ALLOWED_STATUSES}
        canUpdateStatus={canAdminUpdateStatus(selectedAssignmentRow?.assignmentStatus)}
      />
    </Dialog>
  );
}
