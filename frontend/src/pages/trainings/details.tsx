import { useParams, useNavigate } from "react-router-dom";
import { useTrainingById } from "@/hooks/useTrainings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageIcon, Edit } from "lucide-react";
import { config } from "@/config/config";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { useMetadataFile } from "@/hooks/useMetadataFiles";
import { getBlogActivityResourceStatusEnum } from "@/components/common/ResourceStatusBadge";
import { formatDateTime } from "@/utils/dateFormatter";
import { useSelector } from "react-redux";
import type { RootState } from "@/stores/store";
import { UserRole } from "@/models/user";
import { TrainingStatus } from "@/models/training";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";

export default function TrainingDetails() {
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const isAdmin = currentRoles?.includes(UserRole.ADMIN);
  const { data, isLoading, isError, error } = useTrainingById(trainingId);
  const training = data?.data;

  const { data: metadata, isLoading: metadataLoading } = useMetadataFile({
    filePath: training?.metadataFilePath || "",
    resourceId: training?.id || "",
    enabled: !!training, // Only fetch metadata after training is loaded
  });

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
              Error Loading Training
            </h3>
            <p className="text-sm">{error.message}</p>
            <Button className="mt-4" onClick={() => navigate("/trainings")}>
              Back to Trainings
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
          <h3 className="text-lg font-semibold mb-2">Training Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The training you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/trainings")}>
            Back to Trainings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Trainings", href: "/trainings" },
          { label: training?.title || "" },
        ]}
      />

      <div className="space-y-6">
        <div className="rounded-lg border border-border shadow-sm relative gradient-card">
          {isAdmin && training?.id && training?.status !== TrainingStatus.DELETED && (
            <Edit
              onClick={() => navigate(`/trainings/edit/${training.id}`)}
              className="absolute top-4 right-4 z-10 h-4 w-4 cursor-pointer text-foreground hover:text-foreground/80"
            />
          )}
          {!metadataLoading && metadata?.heroImagePath ? (
            <img
              src={`${new URL(config.baseUrl).origin}/${metadata?.heroImagePath}`}
              crossOrigin="anonymous"
              alt="Training Image"
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
              <h3 className="font-bold">{training?.title}</h3>
              <h6 className="text-foreground/60">{metadata?.summary}</h6>
            </div>

            <div className="flex gap-4">
              <Badge variant="outline">
                {getBlogActivityResourceStatusEnum(training?.status)}
              </Badge>
              <Badge variant="outline">
                Created: {formatDateTime(training?.createdAt)}
              </Badge>
              <Badge variant="outline">
                Updated: {formatDateTime(training?.updatedAt)}
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
