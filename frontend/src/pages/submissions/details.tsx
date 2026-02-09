import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  CreditCard,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { useSubmissionById } from "@/hooks/useSubmissions";
import PageTitle from "@/components/common/PageTitle";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { formatDateTime } from "@/utils/dateFormatter";
import type { RootState } from "@/stores/store";
import { UserRole } from "@/models/user";
import { ContentSubmissionStatus, type Submission } from "@/models/submission";
import { StatusUpdateModal } from "@/components/submission/StatusUpdateModal";
import { getConferenceStatusBadge } from "@/components/common/ConferenceStatusBadge";
import {
  getPaymentStatusBadge,
  getSubmissionStatusBadge,
} from "@/components/common/ResourceStatusBadge";

export default function SubmissionDetails() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const isAdmin = Boolean(currentRoles?.includes(UserRole.ADMIN));
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useSubmissionById(submissionId);

  const submission = data?.data as Submission;
  const canUpdateStatus =
    isAdmin &&
    submission?.status !== undefined &&
    [
      ContentSubmissionStatus.DRAFT,
      ContentSubmissionStatus.PENDING_APPROVAL,
      ContentSubmissionStatus.RETURNED,
    ].includes(submission.status);

  if (isLoading) {
    return (
      <div className="relative min-h-[400px]">
        <LoadingOverlay visible />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 text-destructive rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              Error Loading Submission
            </h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Submission Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The submission you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/submissions")}>
            Back to Submissions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Submissions", href: "/submissions" },
          { label: submission.title },
        ]}
      />

      <div className="mb-6">
        <PageTitle title="Submission Details" />
      </div>

      <div className="mb-6">
        <h1 className="font-medium text-lg mb-2">{submission.title}</h1>

        <div>
          <div className="flex items-center gap-2">
            <div>
              Conference:{" "}
              <Link
                to={`/conferences/${submission.conferenceId}`}
                className="underline"
              >
                {submission.conferenceTitle || "-"}
              </Link>{" "}
            </div>
            {getConferenceStatusBadge(submission.conferenceStatus!)}
          </div>

          <div className="text-sm text-foreground/80">
            Topics: {submission.topics?.join(", ") || "-"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Submission In>fo Card */}
        <div
          className={`${isAdmin ? "lg:col-span-2" : "lg:col-span-3"} rounded-lg shadow-small border border-border`}
        >
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

          <div className="p-6 grid grid-cols-2 gap-4">
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
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    {getSubmissionStatusBadge(submission.status)}
                  </div>
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
                  <p className="text-sm text-muted-foreground">
                    Payment Status
                  </p>
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

        <div className="lg:col-span-1 space-y-6">
          {isAdmin && (
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
        </div>
      </div>

      <StatusUpdateModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        selectedSubmission={submission}
        onClose={() => setIsStatusModalOpen(false)}
      />
    </div>
  );
}
