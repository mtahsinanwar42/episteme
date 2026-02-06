import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DownloadCloud, ImageIcon, Edit } from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { useMetadataFile } from "@/hooks/useMetadataFiles";
import {
  useConferenceById,
  useConferencePublications,
} from "@/hooks/useConferences";
import { getConferenceStatusLabel } from "@/components/common/ConferenceStatusBadge";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { fileService } from "@/services/fileService";
import { config } from "@/config/config";
import { formatDateShort } from "@/utils/dateFormatter";
import { useSelector } from "react-redux";
import type { RootState } from "@/stores/store";
import { UserRole } from "@/models/user";

export default function ConferenceDetails() {
  const { conferenceId } = useParams();
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const isAdmin = currentRoles?.includes(UserRole.ADMIN);
  const { data, isLoading, isError, error } = useConferenceById(conferenceId);
  const conference = data?.data;

  const { data: metadata, isLoading: metadataLoading } = useMetadataFile({
    filePath: conference?.metadataFilePath || "",
    resourceId: conference?.id || "",
    enabled: !!conference,
  });

  const {
    data: publicationsResponse,
    isLoading: publicationsLoading,
    isError: publicationsError,
  } = useConferencePublications(conferenceId, { page: 1, limit: 6 });

  const formattedDates = useMemo(() => {
    if (!conference) {
      return null;
    }

    return {
      startAt: formatDateShort(conference.startAt),
      endAt: formatDateShort(conference.endAt),
      submissionStartAt: formatDateShort(conference.submissionPeriodStartAt),
      submissionEndAt: formatDateShort(conference.submissionPeriodEndAt),
    };
  }, [conference]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conference details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 text-destructive rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              Error Loading Conference
            </h3>
            <p className="text-sm">{error?.message}</p>
            <Button className="mt-4" onClick={() => navigate("/conferences")}>
              Back to Conferences
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!conference) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Conference Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The conference you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/conferences")}>
            Back to Conferences
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Conferences", href: "/conferences" },
          { label: conference.title || "" },
        ]}
      />

      <div className="space-y-6">
        <div className="rounded-lg border border-border shadow-sm gradient-card relative">
          {isAdmin && conference?.id && (
            <Edit
              onClick={() => navigate(`/conferences/edit/${conference.id}`)}
              className="absolute top-4 right-4 z-10 h-4 w-4 cursor-pointer text-foreground hover:text-foreground/80"
            />
          )}
          {!metadataLoading && metadata?.heroImagePath ? (
            <img
              src={`${new URL(config.baseUrl).origin}/${metadata?.heroImagePath}`}
              crossOrigin="anonymous"
              alt="Activity Image"
              className="h-56 w-4/5 object-contain rounded-md mx-auto mt-6"
            />
          ) : (
            <div className="w-full h-56 flex items-center justify-center bg-linear-to-br from-slate-700 to-slate-900 animate-pulse rounded-md mx-auto mt-6">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 p-4">
            <div>
              <h2 className="text-2xl font-semibold">{conference.title}</h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge variant="outline">
                {getConferenceStatusLabel(conference.status)}
              </Badge>
              <Badge variant="outline">Start: {formattedDates?.startAt}</Badge>
              <Badge variant="outline">End: {formattedDates?.endAt}</Badge>
              <Badge variant="outline">
                Submission Start: {formattedDates?.submissionStartAt}
              </Badge>
              <Badge variant="outline">
                Submission End: {formattedDates?.submissionEndAt}
              </Badge>
            </div>
          </div>
        </div>

        {!metadataLoading &&
          metadata?.sections &&
          metadata.sections.length > 0 && (
            <div className="space-y-4">
              {metadata.sections.map((section: any, index: number) => (
                <div
                  key={index}
                  className="rounded-lg border border-border shadow-sm"
                >
                  <div className="p-4 gradient-card shadow-sm rounded-t-lg">
                    <h3 className="font-semibold">{section.heading}</h3>
                  </div>
                  <div className="p-4">
                    <MarkdownRenderer content={section.content} />
                  </div>
                </div>
              ))}
            </div>
          )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Published Docs</h3>
          </div>

          {publicationsLoading && (
            <div className="text-muted-foreground">
              Loading published documents...
            </div>
          )}

          {publicationsError && (
            <div className="text-red-600">Failed to load publications.</div>
          )}

          {!publicationsLoading &&
            !publicationsError &&
            (!publicationsResponse?.data ||
              publicationsResponse.data.length === 0) && (
              <div className="text-muted-foreground">
                No published documents available yet.
              </div>
            )}

          {!publicationsLoading &&
            !publicationsError &&
            publicationsResponse?.data &&
            publicationsResponse.data.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publicationsResponse.data.map((publication) => (
                  <div
                    key={publication.submissionId}
                    className="rounded-lg border border-border p-4 shadow-sm bg-card"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {publication.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {publication.authorFirstName}{" "}
                          {publication.authorLastName}
                        </p>
                        {publication.doi && (
                          <p className="text-xs text-muted-foreground">
                            DOI: {publication.doi}
                          </p>
                        )}
                      </div>
                      {publication.storageKey && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            fileService.downloadFile(publication.storageKey)
                          }
                        >
                          <DownloadCloud className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>

                    {publication.topics && publication.topics.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {publication.topics.map((topic) => (
                          <Badge key={topic} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
