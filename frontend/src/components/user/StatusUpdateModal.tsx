import { useState, useEffect } from "react";
import { useUserDetailsMutation } from "@/hooks/useUsers";
import { UserStatus, type User } from "@/models/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
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

interface StatusUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: User | null;
  onClose: () => void;
}

export function StatusUpdateModal({
  open,
  onOpenChange,
  selectedUser,
  onClose,
}: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<number>(1);
  const [statusUpdateNotes, setStatusUpdateNotes] = useState<string>("");
  const updateStatusMutation = useUserDetailsMutation();

  useEffect(() => {
    if (selectedUser) {
      setSelectedStatus(selectedUser.status);
      setStatusUpdateNotes(selectedUser.statusUpdateNotes || "");
    }
  }, [selectedUser]);

  const handleUpdateStatus = () => {
    if (!selectedUser) return;

    updateStatusMutation.mutate(
      {
        userId: selectedUser.id,
        postData: {
          status: selectedStatus,
          statusUpdateNotes,
        },
      },
      {
        onSuccess: () => {
          onClose();
          console.log("User status updated successfully");
        },
        onError: (error) => {
          console.error("Error updating user status:", error);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Update user status</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-foreground mb-2">
                Name: {selectedUser?.firstName} {selectedUser?.lastName}
              </p>
              <p className="text-sm text-foreground mb-2">
                Email: {selectedUser?.email}
              </p>
              <p className="text-sm text-foreground/80 mb-4">
                Current status:{" "}
                {selectedUser && UserStatus[selectedUser.status]}
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
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserStatus.INACTIVE.toString()}>
                    Inactive
                  </SelectItem>
                  <SelectItem value={UserStatus.ACTIVE.toString()}>
                    Active
                  </SelectItem>
                  <SelectItem value={UserStatus.SUSPENDED.toString()}>
                    Suspended
                  </SelectItem>
                  <SelectItem value={UserStatus.DELETED.toString()}>
                    Deleted
                  </SelectItem>
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
