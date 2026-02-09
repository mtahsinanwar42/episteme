import { ResourceStatus } from "@/models/common";
import { Badge } from "@/components/ui/badge";
import { TrainingStatus } from "@/models/training";
import { ContentSubmissionStatus } from "@/models/submission";

export const getBlogActivityResourceStatusEnum = (
  status: ResourceStatus | undefined,
) => {
  switch (status) {
    case ResourceStatus.DRAFT:
      return "Draft";
    case ResourceStatus.PUBLISHED:
      return "Published";
    case ResourceStatus.DELETED:
      return "Deleted";
    default:
      return `${status}`;
  }
};

export const getAnnouncementTrainingResourceStatusEnum = (
  status: TrainingStatus | undefined,
) => {
  switch (status) {
    case TrainingStatus.ONGOING:
      return "Ongoing";
    case TrainingStatus.UPCOMING:
      return "Upcoming";
    case TrainingStatus.COMPLETED:
      return "Completed";
    case TrainingStatus.DELETED:
      return "Deleted";
    default:
      return `${status}`;
  }
};

export const getBlogActivityResourceStatusBadge = (
  status: ResourceStatus | undefined,
) => {
  switch (status) {
    case ResourceStatus.DRAFT:
      return <Badge variant="secondary">Draft</Badge>;
    case ResourceStatus.PUBLISHED:
      return <Badge variant="default">Published</Badge>;
    case ResourceStatus.DELETED:
      return <Badge variant="destructive">Deleted</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const getAnnouncementTrainingResourceStatusBadge = (
  status: TrainingStatus,
) => {
  switch (status) {
    case TrainingStatus.UPCOMING:
      return <Badge variant="secondary">Upcoming</Badge>;
    case TrainingStatus.ONGOING:
      return <Badge variant="default">Ongoing</Badge>;
    case TrainingStatus.COMPLETED:
      return <Badge variant="default">Completed</Badge>;
    case TrainingStatus.DELETED:
      return <Badge variant="destructive">Deleted</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const getSubmissionStatusBadge = (status?: number) => {
  switch (status) {
    case ContentSubmissionStatus.DRAFT:
      return <Badge variant="secondary">Draft</Badge>;
    case ContentSubmissionStatus.PENDING_APPROVAL:
      return <Badge variant="default">Pending Approval</Badge>;
    case ContentSubmissionStatus.RETURNED:
      return <Badge variant="secondary">Returned</Badge>;
    case ContentSubmissionStatus.APPROVED:
      return <Badge variant="default">Approved</Badge>;
    case ContentSubmissionStatus.REJECTED:
      return <Badge variant="destructive">Rejected</Badge>;
    case ContentSubmissionStatus.DELETED:
      return <Badge variant="destructive">Deleted</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const getPaymentStatusBadge = (status?: number) => {
  switch (status) {
    case 0:
      return <Badge variant="secondary">Pending</Badge>;
    case 1:
      return <Badge variant="secondary">Authorized</Badge>;
    case 2:
      return <Badge variant="default">Paid</Badge>;
    case 3:
      return <Badge variant="destructive">Failed</Badge>;
    case 4:
      return <Badge variant="secondary">Refunded</Badge>;
    case 5:
      return <Badge variant="secondary">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
