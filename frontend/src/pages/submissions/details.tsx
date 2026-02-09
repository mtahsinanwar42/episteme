import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  User,
  Building2,
  Mail,
  MapPin,
  Briefcase,
  CreditCard,
  ShieldCheck,
  Tag,
  FileCheck,
} from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { useSubmissionById } from "@/hooks/useSubmissions";
import PageTitle from "@/components/common/PageTitle";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { formatDateTime } from "@/utils/dateFormatter";

export default function SubmissionDetails() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useSubmissionById(submissionId);

  const getStatusBadge = (status?: number) => {
    switch (status) {
      case 1:
        return <Badge variant="secondary">Draft</Badge>;
      case 2:
        return <Badge variant="default">Submitted</Badge>;
      case 3:
        return <Badge variant="default">Approved</Badge>;
      case 4:
        return <Badge variant="secondary">In Review</Badge>;
      case 9:
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status?: number) => {
    switch (status) {
      case 1:
        return <Badge variant="secondary">Pending</Badge>;
      case 2:
        return <Badge variant="default">Paid</Badge>;
      case 9:
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConferenceStatusBadge = (status?: number) => {
    switch (status) {
      case 1:
        return <Badge variant="default">Active</Badge>;
      case 2:
        return <Badge variant="secondary">Completed</Badge>;
      case 9:
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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

  const submission = data.data;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Submissions", href: "/submissions" },
          { label: submission.title },
        ]}
      />

      <div className="mb-6 flex justify-between items-center">
        <PageTitle title="Submission Details" />
        <Button onClick={() => navigate("/submissions")}>
          Back to Submissions
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Submission Info Card */}
        <div className="lg:col-span-2 rounded-lg shadow-small border border-border">
          <div className="p-4 gradient-card shadow-sm">
            <h3 className="font-semibold">Submission Information</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-accent mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium text-lg">{submission.title}</p>
              </div>
            </div>

            {submission.topics && submission.topics.length > 0 && (
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-accent mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Topics</p>
                  <div className="flex gap-2 flex-wrap">
                    {submission.topics.map((topic, idx) => (
                      <Badge key={idx} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {submission.doi && (
              <div className="flex items-start gap-3">
                <FileCheck className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">DOI</p>
                  <p className="font-medium">{submission.doi}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(submission.status)}
                  </div>
                </div>
              </div>

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        {/* Sidebar Cards */}
        <div className="lg:col-span-1 space-y-6">
          {/* Conference Info Card */}
          <div className="rounded-lg shadow-small border border-border">
            <div className="p-4 gradient-card shadow-sm">
              <h3 className="font-semibold">Conference</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium">{submission.conferenceTitle}</p>
              </div>
              {submission.conferenceSlug && (
                <div>
                  <p className="text-sm text-muted-foreground">Slug</p>
                  <p className="font-medium text-sm">
                    {submission.conferenceSlug}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">
                  {getConferenceStatusBadge(submission.conferenceStatus)}
                </div>
              </div>
            </div>
          </div>

          {/* Owner Info Card */}
          <div className="rounded-lg shadow-small border border-border">
            <div className="p-4 gradient-card shadow-sm">
              <h3 className="font-semibold">Owner Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {submission.ownerFirstName} {submission.ownerLastName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-sm break-all">
                    {submission.ownerEmail}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Institution</p>
                  <p className="font-medium">{submission.ownerInstitution}</p>
                </div>
              </div>

              {submission.ownerOccupation && (
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Occupation</p>
                    <p className="font-medium">{submission.ownerOccupation}</p>
                  </div>
                </div>
              )}

              {submission.ownerCountry && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p className="font-medium">{submission.ownerCountry}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
