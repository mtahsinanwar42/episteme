import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { useSubmissionById } from "@/hooks/useSubmissions";
import PageTitle from "@/components/common/PageTitle";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { cn } from "@/lib/utils";
import type { RootState } from "@/stores/store";
import { UserRole } from "@/models/user";
import type { Submission } from "@/models/submission";
import { getConferenceStatusBadge } from "@/components/common/ConferenceStatusBadge";

export type SubmissionOutletContext = {
  submission: Submission;
  isAdmin: boolean;
  isReviewer: boolean;
};

export default function SubmissionDetails() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const isAdmin = Boolean(currentRoles?.includes(UserRole.ADMIN));
  const isReviewer = Boolean(currentRoles?.includes(UserRole.REVIEWER));

  const { data, isLoading, isError, error } = useSubmissionById(submissionId);

  const submission = data?.data as Submission;

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
              Error Loading Submission
            </h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Submission Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The submission you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/submissions")}>
            Back to Submissions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Submissions", href: "/submissions" },
          { label: submission.title },
        ]}
      />

      <div className="mb-6">
        <PageTitle title="Submission Details" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <div className="h-fit gradient-card">
          <nav className="">
            <NavLink
              to={`/submissions/${submission.submissionId}/details`}
              className={({ isActive }) =>
                cn(
                  "block px-4 py-3 bg-slate-900 text-sm hover:bg-accent/70 border-b border-white/20",
                  isActive ? "bg-accent/70 text-foreground" : "",
                )
              }
            >
              Details
            </NavLink>
            <NavLink
              to={`/submissions/${submission.submissionId}/messages`}
              className={({ isActive }) =>
                cn(
                  "block px-4 py-3 bg-slate-900 text-sm hover:bg-accent/70 border-b border-white/20",
                  isActive ? "bg-accent/70 text-foreground" : "",
                )
              }
            >
              Messages
            </NavLink>
            {!isReviewer && (
              <NavLink
                to={`/submissions/${submission.submissionId}/versions`}
                className={({ isActive }) =>
                  cn(
                    "block px-4 py-3 bg-slate-900 text-sm hover:bg-accent/70 border-b border-white/20",
                    isActive ? "bg-accent/70 text-foreground" : "",
                  )
                }
              >
                Versions
              </NavLink>
            )}

            {isAdmin || isReviewer ? (
              <NavLink
                to={`/submissions/${submission.submissionId}/reviews`}
                className={({ isActive }) =>
                  cn(
                    "block px-4 py-3 bg-slate-900 text-sm hover:bg-accent/70",
                    isActive ? "bg-accent/70 text-foreground" : "",
                  )
                }
              >
                Reviews
              </NavLink>
            ) : null}
          </nav>
        </div>

        <div>
          <div className="mb-6">
            <h1 className="mb-2">{submission.title}</h1>

            <div className="flex items-center gap-2">
              Conference:{" "}
              <Link
                to={`/conferences/${submission.conferenceId}`}
                className="underline"
              >
                {submission.conferenceTitle || "-"}
              </Link>
              {getConferenceStatusBadge(submission.conferenceStatus!)}
            </div>

            <div className="text-sm text-foreground/80">
              Topics:{" "}
              {submission.topics && submission.topics.length > 0 ? (
                submission.topics.join(", ")
              ) : (
                <p className="text-sm text-muted-foreground">-</p>
              )}
            </div>
          </div>

          <div>
            <Outlet
              context={{
                submission,
                isAdmin,
                isReviewer,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
