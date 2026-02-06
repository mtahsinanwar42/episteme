import { Card } from "@/components/ui/card";
import { type Activity, ActivityStatus } from "@/models/activity";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserRole } from "@/models/user";
import type { RootState } from "@/stores/store";
import { Edit } from "lucide-react";
import { getBlogActivityResourceStatusBadge } from "../common/ResourceStatusBadge";
import { formatDateTime } from "@/utils/dateFormatter";
import { useMetadataFile } from "@/hooks/useMetadataFiles";
import { config } from "@/config/config";

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

  const { data: metadata } = useMetadataFile({
    filePath: activity.metadataFilePath || "",
    resourceId: activity.id,
  });

  const imageUrl = metadata?.heroImagePath
    ? `${new URL(config.baseUrl).origin}/${metadata.heroImagePath}`
    : undefined;

  const createdDate = formatDateTime(activity.createdAt);

  const handleEdit = () => {
    navigate(`/activities/edit/${activity.id}`);
  };

  return (
    <Card
      title={activity.title}
      description={<div className="truncate">{metadata?.summary}</div>}
      showImage
      imageUrl={imageUrl}
      statusBadge={<>{getBlogActivityResourceStatusBadge(activity.status)}</>}
      metadata={<span className="text-slate-500 text-sm">{createdDate}</span>}
      actions={
        isAdmin && activity.status !== ActivityStatus.DELETED ? <Edit onClick={handleEdit} className="w-4 h-4" /> : undefined
      }
    />
  );
}
