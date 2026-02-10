import { useEffect, useState } from "react";
import type { ReviewAssignment } from "@/models/reviewAssignment";
import {
  ReviewAssignmentStatus,
  ReviewAssignmentStatusLabel,
} from "@/models/reviewAssignment";
import { useUpdateReviewAssignmentStatusMutation } from "@/hooks/useReviewAssignments";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { getReviewAssignmentStatusBadge } from "@/components/common/ReviewAssignmentStatusBadge";
import { getSubmissionStatusBadge } from "@/components/common/SubmissionStatusBadge";
import { getConferenceStatusBadge } from "@/components/common/ConferenceStatusBadge";
import { formatDateTime } from "@/utils/dateFormatter";
import { useSuccessToast } from "@/hooks/useSuccessToast";

interface ReviewAssignmentStatusUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAssignment: ReviewAssignment | null;
  onClose: () => void;
  showNotes?: boolean;
  allowedStatuses: number[];
  canUpdateStatus?: boolean;
  mode?: "admin" | "reviewer";
}

export function ReviewAssignmentStatusUpdateModal({
  open,
  onOpenChange,
  selectedAssignment,
  onClose,
  showNotes = false,
  allowedStatuses,
  canUpdateStatus = true,
  mode = "admin",
}: ReviewAssignmentStatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusUpdateNotes, setStatusUpdateNotes] = useState<string>("");
  const updateStatusMutation = useUpdateReviewAssignmentStatusMutation();
  const { showSuccessToast } = useSuccessToast();
  const hasStatusUpdateNotes = Boolean(
    selectedAssignment?.assignmentStatusUpdateNotes?.trim(),
  );

  useEffect(() => {
    if (selectedAssignment) {
      setSelectedStatus("");
      setStatusUpdateNotes(
        selectedAssignment.assignmentStatusUpdateNotes || "",
      );
    }
  }, [selectedAssignment]);

  const handleUpdateStatus = () => {
    if (!selectedAssignment || !selectedStatus) return;

    const data: { status: number; statusUpdateNotes?: string } = {
      status: Number(selectedStatus),
    };
    if (showNotes) {
      data.statusUpdateNotes = statusUpdateNotes;
    }

    updateStatusMutation.mutate(
      {
        assignmentId: selectedAssignment.assignmentId,
        data,
      },
      {
        onSuccess: () => {
          onClose();
          showSuccessToast("Assignment status updated.");
        },
        onError: (error) => {
          console.error("Failed to update assignment status:", error);
        },
      },
    );
  };

  const handleReviewerAction = (status: ReviewAssignmentStatus) => {
    if (!selectedAssignment) return;

    updateStatusMutation.mutate(
      {
        assignmentId: selectedAssignment.assignmentId,
        data: { status },
      },
      {
        onSuccess: () => {
          onClose();
          showSuccessToast("Assignment status updated.");
        },
        onError: (error) => {
          console.error("Failed to update assignment status:", error);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Review Assignment Details</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Submission Information</h3>
              <div className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-2 text-sm">
                <span className="font-medium text-muted-foreground">Submission</span>
                <span>{selectedAssignment?.submissionTitle}</span>

                <span className="font-medium text-muted-foreground">Submission Status</span>
                <span className="flex items-center">
                  {selectedAssignment &&
                    getSubmissionStatusBadge(selectedAssignment.submissionStatus)}
                </span>

                <span className="font-medium text-muted-foreground">Conference</span>
                <span>{selectedAssignment?.conferenceTitle}</span>

                <span className="font-medium text-muted-foreground">Conference Status</span>
                <span className="flex items-center">
                  {selectedAssignment &&
                    getConferenceStatusBadge(selectedAssignment.conferenceStatus)}
                </span>

                <span className="font-medium text-muted-foreground">Submission Owner</span>
                <div>
                  <div>{selectedAssignment?.ownerFirstName} {selectedAssignment?.ownerLastName}</div>
                  <div className="text-xs text-muted-foreground">{selectedAssignment?.ownerEmail}</div>
                </div>
              </div>

              <hr className="border-border" />

              <h3 className="text-sm font-semibold">Assignment Information</h3>
              <div className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-2 text-sm">
                {mode === "admin" && (
                  <>
                    <span className="font-medium text-muted-foreground">Reviewer</span>
                    <div>
                      <div>{selectedAssignment?.reviewerFirstName} {selectedAssignment?.reviewerLastName}</div>
                      <div className="text-xs text-muted-foreground">{selectedAssignment?.reviewerEmail}</div>
                    </div>
                  </>
                )}

                <span className="font-medium text-muted-foreground">Assigned By</span>
                <div>
                  <div>{selectedAssignment?.assignedByFirstName} {selectedAssignment?.assignedByLastName}</div>
                  <div className="text-xs text-muted-foreground">{selectedAssignment?.assignedByEmail}</div>
                </div>

                <span className="font-medium text-muted-foreground">Assigned At</span>
                <span>
                  {selectedAssignment &&
                    formatDateTime(selectedAssignment.assignedAt)}
                </span>

                {selectedAssignment?.assignedByNotes && (
                  <>
                    <span className="font-medium text-muted-foreground">Assignment Notes</span>
                    <span className="italic text-muted-foreground">
                      {selectedAssignment.assignedByNotes}
                    </span>
                  </>
                )}
                <span className="font-medium text-muted-foreground">Assignment Status</span>
                <span className="flex items-center">
                  {selectedAssignment &&
                    getReviewAssignmentStatusBadge(
                      selectedAssignment.assignmentStatus,
                    )}
                </span>

                {hasStatusUpdateNotes && (
                  <>
                    <span className="font-medium text-muted-foreground">Status Update Notes</span>
                    <span>{selectedAssignment.assignmentStatusUpdateNotes}</span>
                  </>
                )}
              </div>
            </div>

            {canUpdateStatus && mode === "admin" && (
              <>
                <hr className="border-border" />

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select new status *
                  </label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => setSelectedStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedStatuses.map((statusValue) => (
                        <SelectItem
                          key={statusValue}
                          value={statusValue.toString()}
                        >
                          {ReviewAssignmentStatusLabel[statusValue]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {showNotes && (
                  <div className="flex flex-col space-y-2">
                    <label
                      htmlFor="statusUpdateNotes"
                      className="text-sm font-medium"
                    >
                      Status Update Notes
                    </label>
                    <Input
                      id="statusUpdateNotes"
                      name="statusUpdateNotes"
                      type="text"
                      placeholder="Enter status update notes"
                      value={statusUpdateNotes}
                      onChange={(e) => setStatusUpdateNotes(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          {canUpdateStatus && mode === "reviewer" ? (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={updateStatusMutation.isPending}
              >
                Close
              </Button>
              {selectedAssignment?.assignmentStatus !== ReviewAssignmentStatus.DECLINED && (
                <Button
                  variant="outline"
                  onClick={() =>
                    handleReviewerAction(ReviewAssignmentStatus.DECLINED)
                  }
                  disabled={updateStatusMutation.isPending}
                  className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <X className="size-4 mr-1" />
                  Decline
                </Button>
              )}
              {selectedAssignment?.assignmentStatus !== ReviewAssignmentStatus.ACCEPTED && (
                <Button
                  onClick={() =>
                    handleReviewerAction(ReviewAssignmentStatus.ACCEPTED)
                  }
                  disabled={updateStatusMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="size-4 mr-1" />
                  Accept
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={updateStatusMutation.isPending}
              >
                {canUpdateStatus ? "Cancel" : "Close"}
              </Button>
              {canUpdateStatus && (
                <Button
                  onClick={handleUpdateStatus}
                  disabled={
                    updateStatusMutation.isPending || !selectedStatus
                  }
                >
                  {updateStatusMutation.isPending ? "Saving..." : "Save"}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
