import { Badge } from "@/components/ui/badge";
import { ConferenceStatus, ConferenceStatusLabel } from "@/models/conference";

export const getConferenceStatusLabel = (status: number | undefined) => {
  if (status === undefined || status === null) {
    return "Unknown";
  }

  return ConferenceStatusLabel[status] ?? `${status}`;
};

export const getConferenceStatusBadge = (status: number) => {
  switch (status) {
    case ConferenceStatus.INACTIVE:
      return <Badge variant="secondary">Inactive</Badge>;
    case ConferenceStatus.ACTIVE:
      return <Badge variant="default">Active</Badge>;
    case ConferenceStatus.FINISHED:
      return <Badge variant="outline">Finished</Badge>;
    case ConferenceStatus.DELETED:
      return <Badge variant="destructive">Deleted</Badge>;
    default:
      return (
        <Badge variant="outline">{getConferenceStatusLabel(status)}</Badge>
      );
  }
};
