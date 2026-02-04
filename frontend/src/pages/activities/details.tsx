import { useParams, useNavigate } from "react-router-dom";
import { useActivityById } from "@/hooks/useActivities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { config } from "@/config/config";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { useMetadataFile } from "@/hooks/useMetadataFiles";
import { getBlogActivityResourceStatusEnum } from "@/components/common/ResourceStatusBadge";
import { formatDateTime } from "@/utils/dateFormatter";

export default function ActivityDetails() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useActivityById(activityId);
  const activity = data?.data;

  const { data: metadata, isLoading: metadataLoading } = useMetadataFile({
    filePath: activity?.metadataFilePath || "",
    resourceId: activity?.id || "",
    enabled: !!activity, // Only fetch metadata after activity is loaded
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading activity details...</p>
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
              Error Loading Activity
            </h3>
            <p className="text-sm">{error.message}</p>
            <Button className="mt-4" onClick={() => navigate("/activities")}>
              Back to Activities
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Activity Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The activity you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/activities")}>
            Back to Activities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Activities", href: "/activities" },
          { label: activity?.title || "" },
        ]}
      />

      <div className="space-y-6">
        <div className="rounded-lg border border-border shadow-sm relative gradient-card">
          {!metadataLoading && metadata?.heroImagePath ? (
            <img
              src={`${new URL(config.baseUrl).origin}/${metadata?.heroImagePath}`}
              crossOrigin="anonymous"
              alt="Activity Image"
              className="w-full h-96 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-96 flex items-center justify-center bg-linear-to-br from-slate-700 to-slate-900 animate-pulse">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 p-4">
            <div>
              <h3 className="font-bold">{activity?.title}</h3>
              <h6 className="text-foreground/60">{metadata?.summary}</h6>
            </div>

            <div className="flex gap-4">
              <Badge variant="outline">
                {getBlogActivityResourceStatusEnum(activity?.status)}
              </Badge>
              <Badge variant="outline">
                Created: {formatDateTime(activity?.createdAt)}
              </Badge>
              <Badge variant="outline">
                Updated: {formatDateTime(activity?.updatedAt)}
              </Badge>
            </div>
          </div>
        </div>

        {!metadataLoading &&
          metadata?.sections &&
          metadata?.sections?.length > 0 && (
            <>
              {metadata?.sections?.map((section: any, index: number) => (
                <div
                  key={index}
                  className="rounded-lg border border-border shadow-sm "
                >
                  <div className="p-4 gradient-card shadow-sm rounded-t-lg">
                    <h3 className="font-semibold">{section.heading}</h3>
                  </div>

                  <div className="p-4">
                    <MarkdownRenderer content={section.content} />
                  </div>
                </div>
              ))}
            </>
          )}
      </div>
    </div>
  );
}
