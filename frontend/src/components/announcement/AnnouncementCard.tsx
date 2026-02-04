import { Card } from "@/components/ui/card";
import { type Announcement } from "@/models/announcement";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserRole } from "@/models/user";
import type { RootState } from "@/stores/store";
import { Edit } from "lucide-react";
import { getAnnouncementTrainingResourceStatusBadge } from "@/components/common/ResourceStatusBadge";
import { formatDateTime } from "@/utils/dateFormatter";
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
  const createdDate = formatDateTime(announcement.createdAt);

  const handleEdit = () => {
    navigate(`/announcements/edit/${announcement.id}`);
  };

  return (
    <Card
      title={announcement.title}
      statusBadge={
        <>{getAnnouncementTrainingResourceStatusBadge(announcement.status)}</>
      }
      metadata={<span className="text-slate-500 text-sm">{createdDate}</span>}
      actions={
        isAdmin ? <Edit onClick={handleEdit} className="w-4 h-4" /> : undefined
      }
    />
  );
}
