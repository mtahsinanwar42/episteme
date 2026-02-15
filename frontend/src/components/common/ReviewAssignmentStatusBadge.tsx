import { Badge } from "@/components/ui/badge";
import {
  ReviewAssignmentStatus,
  ReviewAssignmentStatusLabel,
} from "@/models/reviewAssignment";

export const getReviewAssignmentStatusLabel = (
  status: number | undefined,
) => {
  if (status === undefined || status === null) {
    return "Unknown";
  }
  return ReviewAssignmentStatusLabel[status] ?? `${status}`;
};

export const getReviewAssignmentStatusBadge = (status: number) => {
  switch (status) {
    case ReviewAssignmentStatus.ASSIGNED:
      return <Badge variant="secondary">Assigned</Badge>;
    case ReviewAssignmentStatus.ACCEPTED:
      return <Badge variant="default">Accepted</Badge>;
    case ReviewAssignmentStatus.DECLINED:
      return <Badge variant="destructive">Declined</Badge>;
    case ReviewAssignmentStatus.COMPLETED:
      return <Badge variant="outline">Completed</Badge>;
    case ReviewAssignmentStatus.CANCELLED:
      return <Badge variant="secondary">Cancelled</Badge>;
    case ReviewAssignmentStatus.OVERDUE:
      return <Badge variant="destructive">Overdue</Badge>;
    case ReviewAssignmentStatus.DELETED:
      return <Badge variant="destructive">Deleted</Badge>;
    default:
      return (
        <Badge variant="outline">
          {getReviewAssignmentStatusLabel(status)}
        </Badge>
      );
  }
};
