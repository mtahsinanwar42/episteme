import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/stores/store";
import { UserRole } from "@/models/user";
import type { Conference } from "@/models/conference";
import { ConferenceStatus } from "@/models/conference";
import { Edit, RefreshCw } from "lucide-react";
import { formatDateTime } from "@/utils/dateFormatter";
import { getConferenceStatusBadge } from "@/components/common/ConferenceStatusBadge";
import { useMetadataFile } from "@/hooks/useMetadataFiles";
import { config } from "@/config/config";
import { Card } from "@/components/ui/card";

interface ConferenceCardProps {
  conference: Conference;
  onStatusUpdate?: (conference: Conference) => void;
}

export function ConferenceCard({
  conference,
  onStatusUpdate,
}: ConferenceCardProps) {
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const isAdmin = currentRoles?.includes(UserRole.ADMIN);

  const { data: metadata } = useMetadataFile({
    filePath: conference.metadataFilePath || "",
    resourceId: conference.id,
  });

  const imageUrl = metadata?.heroImagePath
    ? `${new URL(config.baseUrl).origin}/${metadata.heroImagePath}`
    : undefined;

  const createdAt = useMemo(
    () => formatDateTime(conference.createdAt),
    [conference.createdAt],
  );

  return (
    <Card
      title={conference.title}
      description={<div className="truncate">{metadata?.summary}</div>}
      showImage
      imageUrl={imageUrl}
      statusBadge={<>{getConferenceStatusBadge(conference.status)}</>}
      metadata={<span className="text-slate-500 text-sm">{createdAt}</span>}
      onClick={() => navigate(`/conferences/${conference.id}`)}
      actions={
        isAdmin && conference.status !== ConferenceStatus.DELETED ? (
          <div className="flex items-center gap-3">
            <RefreshCw
              className="w-4 h-4 text-foreground hover:text-foreground/80 cursor-pointer"
              onClick={() => onStatusUpdate?.(conference)}
            />
            <Edit
              className="w-4 h-4 text-foreground hover:text-foreground/80 cursor-pointer"
              onClick={() => navigate(`/conferences/edit/${conference.id}`)}
            />
          </div>
        ) : undefined
      }
    />
  );
}
