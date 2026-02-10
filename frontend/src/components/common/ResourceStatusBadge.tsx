import { ResourceStatus } from "@/models/common";
import { Badge } from "@/components/ui/badge";
import { TrainingStatus } from "@/models/training";
import { SubmissionStatus } from "@/models/submission";

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
    case SubmissionStatus.DRAFT:
      return (
        <Badge
          variant="outline"
          className="bg-slate-800 text-slate-50 border-slate-700"
        >
          Draft
        </Badge>
      );
    case SubmissionStatus.PENDING_APPROVAL:
      return (
        <Badge
          variant="outline"
          className="bg-yellow-300 text-black/90 border-yellow-400"
        >
          Pending Approval
        </Badge>
      );
    case SubmissionStatus.RETURNED:
      return (
        <Badge
          variant="outline"
          className="bg-orange-300 text-black/90 border-orange-400"
        >
          Returned
        </Badge>
      );
    case SubmissionStatus.APPROVED:
      return <Badge variant="default">Approved</Badge>;
    case SubmissionStatus.REJECTED:
      return (
        <Badge
          variant="outline"
          className="bg-rose-600 text-rose-50 border-rose-500"
        >
          Rejected
        </Badge>
      );
    case SubmissionStatus.DELETED:
      return (
        <Badge
          variant="outline"
          className="bg-zinc-600 text-zinc-50 border-zinc-500"
        >
          Deleted
        </Badge>
      );
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
