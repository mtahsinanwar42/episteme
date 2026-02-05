import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/stores/store";
import { UserRole } from "@/models/user";
import type { Conference } from "@/models/conference";
import { ConferenceStatus } from "@/models/conference";
import { Edit } from "lucide-react";
import { formatDateTime, formatDateShort } from "@/utils/dateFormatter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  getConferenceStatusBadge,
  getConferenceStatusLabel,
} from "@/components/common/ConferenceStatusBadge";
import { useUpdateConferenceStatusMutation } from "@/hooks/useConferences";
import { useMetadataFile } from "@/hooks/useMetadataFiles";
import { config } from "@/config/config";

interface ConferenceCardProps {
  conference: Conference;
}

export function ConferenceCard({ conference }: ConferenceCardProps) {
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const isAdmin = currentRoles?.includes(UserRole.ADMIN);

  const updateStatusMutation = useUpdateConferenceStatusMutation(conference.id);
  const [selectedStatus, setSelectedStatus] = useState<number>(
    conference.status,
  );

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
  const startAt = useMemo(
    () => formatDateShort(conference.startAt),
    [conference.startAt],
  );
  const endAt = useMemo(
    () => formatDateShort(conference.endAt),
    [conference.endAt],
  );
  const submissionStartAt = useMemo(
    () => formatDateShort(conference.submissionPeriodStartAt),
    [conference.submissionPeriodStartAt],
  );
  const submissionEndAt = useMemo(
    () => formatDateShort(conference.submissionPeriodEndAt),
    [conference.submissionPeriodEndAt],
  );

  const handleStatusSave = (event: React.MouseEvent) => {
    event.stopPropagation();
    updateStatusMutation.mutate({ status: selectedStatus });
  };

  useEffect(() => {
    setSelectedStatus(conference.status);
  }, [conference.status]);

  return (
    <div
      className="relative grid grid-cols-2 rounded-lg border-b-2 border-border gradient-card shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/conferences/${conference.id}`)}
    >
      <div className="h-full p-4 flex flex-col justify-end gap-4">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            {isAdmin && (
              <div onClick={(e) => e.stopPropagation()} className="">
                <Edit
                  className="w-4 h-4"
                  onClick={() => navigate(`/conferences/edit/${conference.id}`)}
                />
              </div>
            )}

            <h2 className="font-semibold text-foreground pr-4">
              {conference.title}
            </h2>

            <div className="truncate">{metadata?.summary}</div>
          </div>

          <div>
            <div className="grid grid-cols-1 gap-2 text-sm text-foreground/80">
              <div className="flex flex-wrap gap-2">
                <span className="font-medium">Start Date:</span>
                <span>{startAt}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="font-medium">End Date:</span>
                <span>{endAt}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="font-medium">Submission Start:</span>
                <span>{submissionStartAt}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="font-medium">Submission End:</span>
                <span>{submissionEndAt}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {getConferenceStatusBadge(conference.status)}
              <span className="text-xs text-muted-foreground">
                Created: {createdAt}
              </span>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div
            className="mt-2 rounded-md border border-border bg-background/60 p-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Update Status
                </label>
                <Select
                  value={selectedStatus.toString()}
                  onValueChange={(value) => setSelectedStatus(Number(value))}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ConferenceStatus.INACTIVE.toString()}>
                      {getConferenceStatusLabel(ConferenceStatus.INACTIVE)}
                    </SelectItem>
                    <SelectItem value={ConferenceStatus.ACTIVE.toString()}>
                      {getConferenceStatusLabel(ConferenceStatus.ACTIVE)}
                    </SelectItem>
                    <SelectItem value={ConferenceStatus.FINISHED.toString()}>
                      {getConferenceStatusLabel(ConferenceStatus.FINISHED)}
                    </SelectItem>
                    <SelectItem value={ConferenceStatus.DELETED.toString()}>
                      {getConferenceStatusLabel(ConferenceStatus.DELETED)}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleStatusSave}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full bg-slate-100 order-2 h-96">
        <img
          src={imageUrl}
          alt={conference.title}
          className="h-full w-full object-cover"
          crossOrigin="anonymous"
          loading="lazy"
        />
      </div>
    </div>
  );
}
