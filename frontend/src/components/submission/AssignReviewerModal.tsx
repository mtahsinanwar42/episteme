import { useState, useMemo, useRef, useEffect } from "react";
import type { Submission, SubmissionReviewer } from "@/models/submission";
import { UserRole, UserStatus } from "@/models/user";
import {
  ContentSubmissionStatus,
  ReviewAssignmentStatus,
  ReviewAssignmentStatusLabel,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckIcon, ChevronDownIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { getReviewAssignmentStatusBadge } from "@/components/common/ReviewAssignmentStatusBadge";
import { useSubmissionReviewers } from "@/hooks/useSubmissions";
import { useUsers } from "@/hooks/useUsers";
import {
  useCreateReviewAssignmentMutation,
  useUpdateReviewAssignmentStatusMutation,
} from "@/hooks/useReviewAssignments";
import { useSuccessToast } from "@/hooks/useSuccessToast";
import { formatDateTime } from "@/utils/dateFormatter";
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
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [reviewerSearch, setReviewerSearch] = useState<string>("");
  const [isReviewerDropdownOpen, setIsReviewerDropdownOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedAssignmentRow, setSelectedAssignmentRow] =
    useState<SubmissionReviewer | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusUpdateNotes, setStatusUpdateNotes] = useState<string>("");
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
  const updateStatusMutation = useUpdateReviewAssignmentStatusMutation();

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
    let filtered = allReviewers.filter(
      (reviewer) => !assignedReviewerIds.has(String(reviewer.id)),
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
  }, [allReviewersResponse, assignedReviewerIds, reviewerSearch]);

  const selectedReviewerLabel = useMemo(() => {
    if (!selectedReviewerId) return "";
    const allReviewers = allReviewersResponse?.data ?? [];
    const reviewer = allReviewers.find((r) => String(r.id) === selectedReviewerId);
    if (!reviewer) return "";
    return `${reviewer.firstName} ${reviewer.lastName} (${reviewer.email})`;
  }, [selectedReviewerId, allReviewersResponse]);

  const handleAssignReviewer = () => {
    if (!selectedSubmission || !selectedReviewerId) return;

    createAssignmentMutation.mutate(
      {
        contentSubmissionId: submissionId!,
        reviewerUsrId: Number(selectedReviewerId),
        assignedByNotes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSelectedReviewerId("");
          setNotes("");
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
    setReviewerSearch("");
    setIsReviewerDropdownOpen(false);
    setIsStatusModalOpen(false);
    setSelectedAssignmentRow(null);
    setSelectedStatus("");
    setStatusUpdateNotes("");
    onClose();
  };

  const canAdminUpdateStatus = (assignmentStatus?: number): boolean => {
    if (assignmentStatus == null) return false;

    const isAssignmentUpdatable =
      assignmentStatus !== ReviewAssignmentStatus.CANCELLED &&
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
    setSelectedStatus("");
    setStatusUpdateNotes("");
    setIsStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    if (updateStatusMutation.isPending) return;
    setIsStatusModalOpen(false);
    setSelectedAssignmentRow(null);
    setSelectedStatus("");
    setStatusUpdateNotes("");
  };

  const handleUpdateAssignmentStatus = () => {
    if (!selectedAssignmentRow?.assignmentId || !selectedStatus) return;

    updateStatusMutation.mutate(
      {
        assignmentId: selectedAssignmentRow.assignmentId,
        data: {
          status: Number(selectedStatus),
          statusUpdateNotes: statusUpdateNotes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          showSuccessToast("Assignment status updated.");
          handleCloseStatusModal();
        },
        onError: (error) => {
          console.error("Failed to update assignment status:", error);
        },
      },
    );
  };

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
    <Dialog open={open} onOpenChange={onOpenChange} size="xl">
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
                      createAssignmentMutation.isPending || !selectedReviewerId
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

      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent onClose={handleCloseStatusModal}>
          <DialogHeader>
            <DialogTitle>Update Assignment Status</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Status *</label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_ALLOWED_STATUSES.map((statusValue) => (
                      <SelectItem key={statusValue} value={String(statusValue)}>
                        {ReviewAssignmentStatusLabel[statusValue]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="statusUpdateNotes" className="text-sm font-medium">
                  Status Update Notes
                </label>
                <Input
                  id="statusUpdateNotes"
                  name="statusUpdateNotes"
                  type="text"
                  placeholder="Enter status update notes (optional)"
                  value={statusUpdateNotes}
                  onChange={(e) => setStatusUpdateNotes(e.target.value)}
                  disabled={updateStatusMutation.isPending}
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseStatusModal}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAssignmentStatus}
              disabled={
                updateStatusMutation.isPending ||
                !selectedStatus ||
                !canAdminUpdateStatus(selectedAssignmentRow?.assignmentStatus)
              }
            >
              {updateStatusMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
