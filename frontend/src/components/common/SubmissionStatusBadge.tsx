import { Badge } from "@/components/ui/badge";
import {
  ContentSubmissionStatus,
  ContentSubmissionStatusLabel,
} from "@/models/reviewAssignment";

export const getSubmissionStatusLabel = (status: number | undefined) => {
  if (status === undefined || status === null) {
    return "Unknown";
  }
  return ContentSubmissionStatusLabel[status] ?? `${status}`;
};

export const getSubmissionStatusBadge = (status: number) => {
  switch (status) {
    case ContentSubmissionStatus.DRAFT:
      return <Badge variant="secondary">Draft</Badge>;
    case ContentSubmissionStatus.PENDING_APPROVAL:
      return <Badge variant="default">Pending Approval</Badge>;
    case ContentSubmissionStatus.RETURNED:
      return <Badge variant="outline">Returned</Badge>;
    case ContentSubmissionStatus.APPROVED:
      return <Badge variant="default">Approved</Badge>;
    case ContentSubmissionStatus.REJECTED:
      return <Badge variant="destructive">Rejected</Badge>;
    case ContentSubmissionStatus.DELETED:
      return <Badge variant="destructive">Deleted</Badge>;
    default:
      return (
        <Badge variant="outline">{getSubmissionStatusLabel(status)}</Badge>
      );
  }
};
