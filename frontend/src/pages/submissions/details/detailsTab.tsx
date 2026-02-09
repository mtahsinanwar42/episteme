import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Calendar,
  CreditCard,
  FileCheck,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusUpdateModal } from "@/components/submission/StatusUpdateModal";
import { ContentSubmissionStatus, type Submission } from "@/models/submission";
import { formatDateTime } from "@/utils/dateFormatter";
import type { SubmissionOutletContext } from "@/pages/submissions/details";
import {
  getPaymentStatusBadge,
  getSubmissionStatusBadge,
} from "@/components/common/ResourceStatusBadge";

export default function SubmissionDetailsTab() {
  const { submission, isAdmin } = useOutletContext<SubmissionOutletContext>();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const canUpdateStatus =
    isAdmin &&
    submission.status !== undefined &&
    [
      ContentSubmissionStatus.DRAFT,
      ContentSubmissionStatus.PENDING_APPROVAL,
      ContentSubmissionStatus.RETURNED,
    ].includes(submission.status);

  const shouldShowOwner =
    isAdmin &&
    Boolean(
      submission.ownerEmail ||
      submission.ownerFirstName ||
      submission.ownerLastName,
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-lg shadow-small border border-border">
        <div className="p-4 gradient-card shadow-sm flex justify-between items-center">
          <h3 className="font-semibold">Submission Information</h3>
          {canUpdateStatus && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsStatusModalOpen(true)}
            >
              Update Status
            </Button>
          )}
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {submission.doi && (
            <div className="flex items-start gap-3">
              <FileCheck className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">DOI</p>
                <p className="font-medium">{submission.doi}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-1">
                {getSubmissionStatusBadge(submission.status)}
              </div>
            </div>
          </div>

          {submission.statusUpdateNotes && (
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-accent mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Status Update Notes
                </p>
                <p className="font-medium">{submission.statusUpdateNotes}</p>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <div className="mt-1">
                  {getPaymentStatusBadge(submission.paymentStatus)}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {formatDateTime(submission.createdAt || "")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Updated</p>
              <p className="font-medium">
                {formatDateTime(submission.updatedAt || "")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {shouldShowOwner && (
        <div className="rounded-lg shadow-small border border-border">
          <div className="p-4 gradient-card shadow-sm">
            <h3 className="font-semibold">Owner Information</h3>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium col-span-2">
                {submission.ownerFirstName} {submission.ownerLastName}
              </p>
            </div>
            {submission.ownerEmail && (
              <div className="grid grid-cols-3 gap-4">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-sm break-all col-span-2">
                  {submission.ownerEmail}
                </p>
              </div>
            )}
            {submission.ownerInstitution && (
              <div className="grid grid-cols-3 gap-4">
                <p className="text-sm text-muted-foreground">Institution</p>
                <p className="font-medium col-span-2">
                  {submission.ownerInstitution}
                </p>
              </div>
            )}
            {submission.ownerOccupation && (
              <div className="grid grid-cols-3 gap-4">
                <p className="text-sm text-muted-foreground">Occupation</p>
                <p className="font-medium col-span-2">
                  {submission.ownerOccupation}
                </p>
              </div>
            )}
            {submission.ownerCountry && (
              <div className="grid grid-cols-3 gap-4">
                <p className="text-sm text-muted-foreground">Country</p>
                <p className="font-medium col-span-2">
                  {submission.ownerCountry}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <StatusUpdateModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        selectedSubmission={submission as Submission}
        onClose={() => setIsStatusModalOpen(false)}
      />
    </div>
  );
}
