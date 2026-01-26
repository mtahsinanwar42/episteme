import { useParams, useNavigate } from "react-router-dom";
import { useActivityById } from "@/hooks/useActivities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";
import { ActivityStatus } from "@/models/activity";
import { config } from "@/config/config";

export default function ActivityDetailsPage() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useActivityById(activityId);

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

  const activity = data.data;

  const getStatusBadge = (status: number) => {
    switch (status) {
      case ActivityStatus.DRAFT:
        return <Badge variant="secondary">Draft</Badge>;
      case ActivityStatus.PUBLISHED:
        return <Badge variant="default">Published</Badge>;
      case ActivityStatus.DELETED:
        return <Badge variant="destructive">Deleted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const imageUrl = activity.metadataFilePath
    ? `${new URL(config.baseUrl).origin}/${activity.metadataFilePath}`
    : null;

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/activities")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Activities
        </Button>
        <h1 className="text-4xl text-accent font-bold mb-2">
          Activity Details
        </h1>
      </div>

      <div className="rounded-lg shadow-small p-6 bg-white">
        {imageUrl && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt={activity.title}
              className="w-full max-h-[400px] object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {activity.title}
            </h2>
            <div className="flex items-center gap-3">
              {getStatusBadge(activity.status)}
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Created: {new Date(activity.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Updated: {new Date(activity.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-slate-500">Activity ID: {activity.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
