import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { config } from "@/config/config";
import { ActivityStatus, type Activity } from "@/models/activity";

interface ActivityCardProps {
  activity: Activity;
  showImage?: boolean;
}

function statusLabel(status: number) {
  switch (status) {
    case ActivityStatus.DRAFT:
      return "Draft";
    case ActivityStatus.PUBLISHED:
      return "Published";
    case ActivityStatus.DELETED:
      return "Deleted";
    default:
      return String(status);
  }
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const createdDate = new Date(activity.createdAt).toLocaleString();

  return (
    <Card
      title={activity.title}
      statusBadge={
        <Badge variant="outline">{statusLabel(activity.status)}</Badge>
      }
      metadata={<span className="text-slate-500 text-sm">{createdDate}</span>}
    />
  );
}
