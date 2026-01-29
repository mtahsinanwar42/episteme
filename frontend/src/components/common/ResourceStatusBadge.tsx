import { ResourceStatus } from "@/models/common";
import { Badge } from "@/components/ui/badge";

export const getResourceStatusEnum = (status: ResourceStatus | undefined) => {
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

export const getResourceStatusBadge = (status: ResourceStatus) => {
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
