import { Card } from "@/components/ui/card";
import { type Activity } from "@/models/activity";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserRole } from "@/models/user";
import type { RootState } from "@/stores/store";
import { Edit } from "lucide-react";
import { getBlogActivityResourceStatusBadge } from "../common/ResourceStatusBadge";

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

  const handleEdit = () => {
    navigate(`/activities/edit/${activity.id}`);
  };

  return (
    <Card
      title={activity.title}
      statusBadge={<>{getBlogActivityResourceStatusBadge(activity.status)}</>}
      metadata={<span className="text-slate-500 text-sm">{createdDate}</span>}
      actions={
        isAdmin ? <Edit onClick={handleEdit} className="w-4 h-4" /> : undefined
      }
    />
  );
}
