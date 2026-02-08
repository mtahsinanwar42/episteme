import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DownloadCloud, ImageIcon, Edit, RefreshCw } from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { useMetadataFile } from "@/hooks/useMetadataFiles";
import {
  useConferenceById,
  useConferencePublications,
} from "@/hooks/useConferences";
import { ConferenceStatusUpdateModal } from "@/components/conference/ConferenceStatusUpdateModal";
import { getConferenceStatusLabel } from "@/components/common/ConferenceStatusBadge";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { fileService } from "@/services/fileService";
import { config } from "@/config/config";
import { formatDateShort } from "@/utils/dateFormatter";
import { useSelector } from "react-redux";
import type { RootState } from "@/stores/store";
import { UserRole } from "@/models/user";
import type { Conference } from "@/models/conference";
import { ConferenceStatus } from "@/models/conference";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { Pagination } from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";

export default function ConferenceDetails() {
  const { conferenceId } = useParams();
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedConference, setSelectedConference] =
    useState<Conference | null>(null);
  const [publicationsPage, setPublicationsPage] = useState(1);
  const [publicationsPageSize, setPublicationsPageSize] = useState(6);
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
  } = useConferencePublications(conferenceId, {
    page: publicationsPage,
    limit: publicationsPageSize,
  });
  const publications = publicationsResponse?.data || [];
  const publicationsTotal = publicationsResponse?.total || 0;
  const publicationsCurrentPage = publicationsResponse?.page || publicationsPage;
  const publicationsCurrentLimit =
    publicationsResponse?.limit || publicationsPageSize;
  const publicationsTotalPages = Math.max(
    1,
    Math.ceil(publicationsTotal / publicationsCurrentLimit),
  );

  const handlePublicationsPageChange = (newPage: number) => {
    setPublicationsPage(newPage);
  };

  const handlePublicationsPageSizeChange = (newPageSize: number) => {
    setPublicationsPageSize(newPageSize);
    setPublicationsPage(1);
  };

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

  const handleOpenStatusModal = (selectedItem: Conference) => {
    setSelectedConference(selectedItem);
    setIsStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setSelectedConference(null);
    setIsStatusModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="relative min-h-[400px]">
        <LoadingOverlay visible />
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
          {isAdmin &&
            conference?.id &&
            conference?.status !== ConferenceStatus.DELETED && (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
                <RefreshCw
                  onClick={() => handleOpenStatusModal(conference)}
                  className="h-4 w-4 cursor-pointer text-foreground hover:text-foreground/80"
                />
                <Edit
                  onClick={() => navigate(`/conferences/edit/${conference.id}`)}
                  className="h-4 w-4 cursor-pointer text-foreground hover:text-foreground/80"
                />
              </div>
            )}
          {!metadataLoading && metadata?.heroImagePath ? (
            <img
              src={`${new URL(config.baseUrl).origin}/${metadata?.heroImagePath}`}
              crossOrigin="anonymous"
              alt="Conference Image"
              className="w-3/5 aspect-video object-cover rounded-md mx-auto mt-6"
            />
          ) : (
            <div className={`w-3/5 aspect-video flex items-center justify-center bg-linear-to-br from-slate-700 to-slate-900 rounded-md mx-auto mt-6${metadataLoading ? ' animate-pulse' : ''}`}>
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

        <div className="rounded-lg border border-border shadow-sm">
          <div className="p-4 gradient-card shadow-sm rounded-t-lg">
            <h3 className="font-semibold">Published Docs</h3>
          </div>
          <div className="p-4 space-y-4">
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
              publications.length === 0 && (
                <div className="text-muted-foreground">
                  No published documents available yet.
                </div>
              )}

            {!publicationsLoading &&
              !publicationsError &&
              publications.length > 0 && (
                <div className="flex flex-col items-center gap-6">
                  <div className="w-full max-w-2/3 flex flex-col gap-12">
                    {publications.map((publication) => (
                      <Card
                        key={publication.submissionId}
                        title={publication.title}
                        showImage={false}
                        description={
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Author: {publication.authorFirstName}{" "}
                              {publication.authorLastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Email: {publication.authorEmail}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Institution:{" "}
                              {publication.authorInstitution || "N/A"}
                            </p>
                            {publication.doi && (
                              <p className="text-xs text-muted-foreground">
                                DOI: {publication.doi}
                              </p>
                            )}
                            {publication.topics &&
                              publication.topics.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {publication.topics.map((topic) => (
                                    <Badge key={topic} variant="secondary">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                          </div>
                        }
                        metadata={
                          <span className="text-slate-500 text-sm">
                            Updated: {formatDateShort(publication.updatedAt)}
                          </span>
                        }
                        actions={
                          publication.storageKey ? (
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label="Download publication"
                              onClick={() =>
                                fileService.downloadFile(publication.storageKey)
                              }
                            >
                              <DownloadCloud className="w-4 h-4" />
                            </Button>
                          ) : undefined
                        }
                      />
                    ))}
                  </div>

                  {publicationsTotal > 0 && (
                    <Pagination
                      currentPage={publicationsCurrentPage}
                      totalPages={publicationsTotalPages}
                      pageSize={publicationsCurrentLimit}
                      totalItems={publicationsTotal}
                      onPageChange={handlePublicationsPageChange}
                      onPageSizeChange={handlePublicationsPageSizeChange}
                      pageSizeOptions={[3, 6, 9, 12]}
                    />
                  )}
                </div>
              )}
          </div>
        </div>
      </div>

      <ConferenceStatusUpdateModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        selectedConference={selectedConference}
        onClose={handleCloseStatusModal}
      />
    </div>
  );
}
