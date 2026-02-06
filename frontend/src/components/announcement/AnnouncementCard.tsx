import { Card } from "@/components/ui/card";
import { type Announcement, AnnouncementStatus } from "@/models/announcement";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserRole } from "@/models/user";
import type { RootState } from "@/stores/store";
import { Edit } from "lucide-react";
import { getAnnouncementTrainingResourceStatusBadge } from "@/components/common/ResourceStatusBadge";
import { formatDateTime } from "@/utils/dateFormatter";
import { useMetadataFile } from "@/hooks/useMetadataFiles";
import { config } from "@/config/config";
interface AnnouncementCardProps {
  announcement: Announcement;
  showImage?: boolean;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const isAdmin = currentRoles?.includes(UserRole.ADMIN);

  const { data: metadata } = useMetadataFile({
    filePath: announcement.metadataFilePath || "",
    resourceId: announcement.id,
  });

  const imageUrl = metadata?.heroImagePath
    ? `${new URL(config.baseUrl).origin}/${metadata.heroImagePath}`
    : undefined;

  const createdDate = formatDateTime(announcement.createdAt);

  const handleEdit = () => {
    navigate(`/announcements/edit/${announcement.id}`);
  };

  return (
    <Card
      title={announcement.title}
      description={<div className="truncate">{metadata?.summary}</div>}
      showImage
      imageUrl={imageUrl}
      statusBadge={
        <>{getAnnouncementTrainingResourceStatusBadge(announcement.status)}</>
      }
      metadata={<span className="text-slate-500 text-sm">{createdDate}</span>}
      actions={
        isAdmin && announcement.status !== AnnouncementStatus.DELETED ? <Edit onClick={handleEdit} className="w-4 h-4" /> : undefined
      }
    />
  );
}
