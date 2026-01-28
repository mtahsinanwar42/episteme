import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TrainingStatus, type Training } from "@/models/training";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserRole } from "@/models/user";
import type { RootState } from "@/stores/store";
import { Edit } from "lucide-react";

interface TrainingCardProps {
  training: Training;
  showImage?: boolean;
}

export function TrainingCard({ training }: TrainingCardProps) {
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const isAdmin = currentRoles?.includes(UserRole.ADMIN);
  const createdDate = new Date(training.createdAt).toLocaleString();

  const getStatusBadge = (status: number) => {
    switch (status) {
      case TrainingStatus.DRAFT:
        return <Badge variant="secondary">Draft</Badge>;
      case TrainingStatus.PUBLISHED:
        return <Badge variant="default">Published</Badge>;
      case TrainingStatus.DELETED:
        return <Badge variant="destructive">Deleted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEdit = () => {
    navigate(`/trainings/edit/${training.id}`);
  };

  return (
    <Card
      title={training.title}
      statusBadge={<>{getStatusBadge(training.status)}</>}
      metadata={<span className="text-slate-500 text-sm">{createdDate}</span>}
      actions={
        isAdmin ? <Edit className="w-4 h-4" onClick={handleEdit} /> : undefined
      }
    />
  );
}
