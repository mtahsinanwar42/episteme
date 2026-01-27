import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { config } from "@/config/config";
import { ActivityStatus, type Activity } from "@/models/activity";

interface ActivityCardProps {
  activity: Activity;
  showImage?: boolean;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const createdDate = new Date(activity.createdAt).toLocaleString();

  const getStatusBadge = (status: number) => {
    switch (status) {
      case ActivityStatus.DRAFT:
        return <Badge variant="secondary">Draft</Badge>;
      case ActivityStatus.PUBLISHED:
        return <Badge variant="default">Published</Badge>;
      case ActivityStatus.DELETED:
        return <Badge variant="destructive">Deleted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card
      title={activity.title}
      statusBadge={<>{getStatusBadge(activity.status)}</>}
      metadata={<span className="text-slate-500 text-sm">{createdDate}</span>}
    />
  );
}
