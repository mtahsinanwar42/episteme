import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityStatus, type Activity } from "@/models/activity";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserRole } from "@/models/user";
import type { RootState } from "@/stores/store";
import { Edit, Pencil } from "lucide-react";

interface ActivityCardProps {
  activity: Activity;
  showImage?: boolean;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const isAdmin = currentRoles?.includes(UserRole.ADMIN);
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

  const handleEdit = () => {
    navigate(`/activities/edit/${activity.id}`);
  };

  return (
    <Card
      title={activity.title}
      statusBadge={<>{getStatusBadge(activity.status)}</>}
      metadata={<span className="text-slate-500 text-sm">{createdDate}</span>}
      actions={
        isAdmin ? <Edit onClick={handleEdit} className="w-4 h-4" /> : undefined
      }
    />
  );
}
