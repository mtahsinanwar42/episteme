import { useEffect, useState } from "react";
import { ContentSubmissionStatus, type Submission } from "@/models/submission";
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
import { useUpdateSubmissionStatusMutation } from "@/hooks/useSubmissions";
import { useSuccessToast } from "@/hooks/useSuccessToast";

interface StatusUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSubmission: Submission | null;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  ContentSubmissionStatus.DRAFT,
  ContentSubmissionStatus.PENDING_APPROVAL,
  ContentSubmissionStatus.RETURNED,
  ContentSubmissionStatus.APPROVED,
  ContentSubmissionStatus.REJECTED,
  ContentSubmissionStatus.DELETED,
];

const STATUS_LABELS: Record<number, string> = {
  [ContentSubmissionStatus.DRAFT]: "Draft",
  [ContentSubmissionStatus.PENDING_APPROVAL]: "Pending Approval",
  [ContentSubmissionStatus.RETURNED]: "Returned",
  [ContentSubmissionStatus.APPROVED]: "Approved",
  [ContentSubmissionStatus.REJECTED]: "Rejected",
  [ContentSubmissionStatus.DELETED]: "Deleted",
};

export function StatusUpdateModal({
  open,
  onOpenChange,
  selectedSubmission,
  onClose,
}: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<number>(
    ContentSubmissionStatus.PENDING_APPROVAL,
  );
  const [statusUpdateNotes, setStatusUpdateNotes] = useState<string>("");
  const { showSuccessToast } = useSuccessToast();

  const updateStatusMutation = useUpdateSubmissionStatusMutation(
    selectedSubmission?.submissionId ?? selectedSubmission?.id ?? "",
  );

  useEffect(() => {
    if (selectedSubmission) {
      setSelectedStatus(
        selectedSubmission.status ?? ContentSubmissionStatus.DRAFT,
      );
      setStatusUpdateNotes(selectedSubmission.statusUpdateNotes ?? "");
    }
  }, [selectedSubmission]);

  const handleUpdateStatus = () => {
    if (!selectedSubmission) return;

    updateStatusMutation.mutate(
      {
        status: selectedStatus,
        statusUpdateNotes: statusUpdateNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          showSuccessToast("Submission status updated successfully.");
        },
        onError: (error) => {
          console.error("Error updating submission status:", error);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Update submission status</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-foreground mb-2">
                Title: {selectedSubmission?.title}
              </p>
              <p className="text-sm text-foreground/80">
                Current status:{" "}
                {
                  STATUS_LABELS[
                    selectedSubmission?.status ?? ContentSubmissionStatus.DRAFT
                  ]
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Select new status *
              </label>
              <Select
                value={selectedStatus.toString()}
                onValueChange={(value) => setSelectedStatus(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status.toString()}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={updateStatusMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
