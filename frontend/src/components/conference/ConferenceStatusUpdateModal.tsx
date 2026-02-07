import { useEffect, useState } from "react";
import type { Conference } from "@/models/conference";
import { ConferenceStatus } from "@/models/conference";
import { useUpdateConferenceStatusMutation } from "@/hooks/useConferences";
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
import { getConferenceStatusLabel } from "@/components/common/ConferenceStatusBadge";
import { useSuccessToast } from "@/hooks/useSuccessToast";

interface ConferenceStatusUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedConference: Conference | null;
  onClose: () => void;
}

export function ConferenceStatusUpdateModal({
  open,
  onOpenChange,
  selectedConference,
  onClose,
}: ConferenceStatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<number>(
    ConferenceStatus.ACTIVE,
  );
  const { showSuccessToast } = useSuccessToast();
  const updateStatusMutation = useUpdateConferenceStatusMutation(
    selectedConference?.id ?? "",
  );

  useEffect(() => {
    if (selectedConference) {
      setSelectedStatus(selectedConference.status);
    }
  }, [selectedConference]);

  const handleUpdateStatus = () => {
    if (!selectedConference) return;

    updateStatusMutation.mutate(
      {
        status: selectedStatus,
      },
      {
        onSuccess: () => {
          onClose();
          showSuccessToast("Conference status updated successfully.");
        },
        onError: (error) => {
          console.error("Error updating conference status:", error);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Update conference status</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-foreground mb-2">
                Title: {selectedConference?.title}
              </p>
              <p className="text-sm text-foreground/80">
                Current status:{" "}
                {selectedConference &&
                  getConferenceStatusLabel(selectedConference.status)}
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
                  <SelectItem value={ConferenceStatus.INACTIVE.toString()}>
                    {getConferenceStatusLabel(ConferenceStatus.INACTIVE)}
                  </SelectItem>
                  <SelectItem value={ConferenceStatus.ACTIVE.toString()}>
                    {getConferenceStatusLabel(ConferenceStatus.ACTIVE)}
                  </SelectItem>
                  <SelectItem value={ConferenceStatus.FINISHED.toString()}>
                    {getConferenceStatusLabel(ConferenceStatus.FINISHED)}
                  </SelectItem>
                  <SelectItem value={ConferenceStatus.DELETED.toString()}>
                    {getConferenceStatusLabel(ConferenceStatus.DELETED)}
                  </SelectItem>
                </SelectContent>
              </Select>
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
