import { useOutletContext } from "react-router-dom";
import type { SubmissionOutletContext } from "@/pages/submissions/details";

export default function SubmissionReviews() {
  const { submission } = useOutletContext<SubmissionOutletContext>();

  return (
    <div className="rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold">Reviews</h3>
      <p className="text-sm text-muted-foreground mt-2">
        Reviews for "{submission.title}" will appear here.
      </p>
    </div>
  );
}
