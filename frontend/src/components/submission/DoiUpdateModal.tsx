import { useEffect, useState } from "react";
import type { Submission } from "@/models/submission";
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
import { useUpdateSubmissionDoiMutation } from "@/hooks/useSubmissions";
import { useSuccessToast } from "@/hooks/useSuccessToast";

interface DoiUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSubmission: Submission | null;
  onClose: () => void;
}

export function DoiUpdateModal({
  open,
  onOpenChange,
  selectedSubmission,
  onClose,
}: DoiUpdateModalProps) {
  const [doi, setDoi] = useState<string>("");
  const { showSuccessToast } = useSuccessToast();

  const updateDoiMutation = useUpdateSubmissionDoiMutation(
    selectedSubmission?.submissionId ?? selectedSubmission?.id ?? "",
  );

  useEffect(() => {
    if (selectedSubmission) {
      setDoi(selectedSubmission.doi ?? "");
    }
  }, [selectedSubmission]);

  const handleUpdateDoi = () => {
    if (!selectedSubmission || !doi.trim()) return;

    updateDoiMutation.mutate(
      { doi: doi.trim() },
      {
        onSuccess: () => {
          onClose();
          showSuccessToast("Submission DOI updated successfully.");
        },
        onError: (error) => {
          console.error("Error updating submission DOI:", error);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Update Submission DOI</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-foreground mb-2">
                Title: {selectedSubmission?.title}
              </p>
              {selectedSubmission?.doi && (
                <p className="text-sm text-foreground/80">
                  Current DOI: {selectedSubmission.doi}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="doi" className="text-sm font-medium">
                DOI *
              </label>
              <Input
                id="doi"
                name="doi"
                type="text"
                placeholder="Enter DOI"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={updateDoiMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateDoi}
            disabled={updateDoiMutation.isPending || !doi.trim()}
          >
            {updateDoiMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
