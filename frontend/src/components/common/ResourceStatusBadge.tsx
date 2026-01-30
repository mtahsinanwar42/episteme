import { ResourceStatus } from "@/models/common";
import { Badge } from "@/components/ui/badge";
import { TrainingStatus } from "@/models/training";

export const getBlogActivityResourceStatusEnum = (status: ResourceStatus) => {
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
