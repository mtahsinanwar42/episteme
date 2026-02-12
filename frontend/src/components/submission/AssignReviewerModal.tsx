import { useState, useMemo } from "react";
import type { Submission, SubmissionReviewer } from "@/models/submission";
import { UserRole } from "@/models/user";
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
import { DataTable } from "@/components/ui/data-table";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { useSubmissionReviewers } from "@/hooks/useSubmissions";
import { useUsers } from "@/hooks/useUsers";
import { useCreateReviewAssignmentMutation } from "@/hooks/useReviewAssignments";
import { useSuccessToast } from "@/hooks/useSuccessToast";
import type { ColumnDef } from "@tanstack/react-table";

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
  const { showSuccessToast } = useSuccessToast();

  const submissionId =
    selectedSubmission?.submissionId ?? selectedSubmission?.id;

  const { data: reviewersData, isLoading: reviewersLoading } =
    useSubmissionReviewers(submissionId, { enabled: open && !!submissionId });

  const { data: allReviewersResponse, isLoading: allReviewersLoading } =
    useUsers({
      roles: UserRole.REVIEWER,
      paginate: false,
      sort: "-createdAt",
    });

  const createAssignmentMutation = useCreateReviewAssignmentMutation();

  const assignedReviewers = useMemo(() => {
    return reviewersData?.data ?? [];
  }, [reviewersData]);

  const assignedReviewerIds = useMemo(() => {
    return new Set(assignedReviewers.map((r) => String(r.id)));
  }, [assignedReviewers]);

  const availableReviewers = useMemo(() => {
    const allReviewers = allReviewersResponse?.data ?? [];
    return allReviewers.filter(
      (reviewer) => !assignedReviewerIds.has(String(reviewer.id)),
    );
  }, [allReviewersResponse, assignedReviewerIds]);

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
    onClose();
  };

  const columns: ColumnDef<SubmissionReviewer>[] = [
    {
      accessorKey: "name",
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
      accessorKey: "status",
      header: "Assignment Status",
      cell: ({ row }) => row.original.status ?? "-",
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
                  <Select
                    value={selectedReviewerId}
                    onValueChange={setSelectedReviewerId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableReviewers.map((reviewer) => (
                        <SelectItem
                          key={reviewer.id}
                          value={String(reviewer.id)}
                        >
                          {reviewer.firstName} {reviewer.lastName} (
                          {reviewer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              {assignedReviewers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">
                    Assigned Reviewers ({assignedReviewers.length})
                  </h4>
                  <DataTable columns={columns} data={assignedReviewers} />
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
    </Dialog>
  );
}
