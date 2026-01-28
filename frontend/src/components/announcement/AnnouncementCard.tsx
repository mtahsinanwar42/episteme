import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnnouncementStatus, type Announcement } from "@/models/announcement";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserRole } from "@/models/user";
import type { RootState } from "@/stores/store";
import { Edit, Pencil } from "lucide-react";

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
  const createdDate = new Date(announcement.createdAt).toLocaleString();

  const getStatusBadge = (status: number) => {
    switch (status) {
      case AnnouncementStatus.DRAFT:
        return <Badge variant="secondary">Draft</Badge>;
      case AnnouncementStatus.PUBLISHED:
        return <Badge variant="default">Published</Badge>;
      case AnnouncementStatus.DELETED:
        return <Badge variant="destructive">Deleted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEdit = () => {
    navigate(`/announcements/edit/${announcement.id}`);
  };

  return (
    <Card
      title={announcement.title}
      statusBadge={<>{getStatusBadge(announcement.status)}</>}
      metadata={<span className="text-slate-500 text-sm">{createdDate}</span>}
      actions={
        isAdmin ? <Edit onClick={handleEdit} className="w-4 h-4" /> : undefined
      }
    />
  );
}
