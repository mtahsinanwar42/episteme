import { Card } from "@/components/ui/card";
import { type Training } from "@/models/training";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserRole } from "@/models/user";
import type { RootState } from "@/stores/store";
import { Edit } from "lucide-react";
import { getResourceStatusBadge } from "../common/ResourceStatusBadge";

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

  const handleEdit = () => {
    navigate(`/trainings/edit/${training.id}`);
  };

  return (
    <Card
      title={training.title}
      statusBadge={<>{getResourceStatusBadge(training.status)}</>}
      metadata={<span className="text-slate-500 text-sm">{createdDate}</span>}
      actions={
        isAdmin ? <Edit className="w-4 h-4" onClick={handleEdit} /> : undefined
      }
    />
  );
}
