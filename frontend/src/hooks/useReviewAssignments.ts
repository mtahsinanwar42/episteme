import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewAssignmentService } from "@/services/reviewAssignmentService";
import type {
  GetReviewAssignmentsParams,
  UpdateReviewAssignmentStatusRequest,
} from "@/models/reviewAssignment";
import type { SearchReviewAssignmentsParams } from "@/services/reviewAssignmentService";

export function useReviewAssignments(params?: GetReviewAssignmentsParams) {
  return useQuery({
    queryKey: ["reviewAssignments", params],
    queryFn: () => reviewAssignmentService.getReviewAssignments(params),
  });
}

export function useMyReviewAssignments(
  params?: GetReviewAssignmentsParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["myReviewAssignments", params],
    queryFn: () => reviewAssignmentService.getMyReviewAssignments(params),
    enabled: options?.enabled,
  });
}

export function useSearchReviewAssignments(
  params?: SearchReviewAssignmentsParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["reviewAssignments", "search", params],
    queryFn: () => reviewAssignmentService.searchReviewAssignments(params),
    enabled: options?.enabled,
  });
}

export function useUpdateReviewAssignmentStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assignmentId,
      data,
    }: {
      assignmentId: number | string;
      data: UpdateReviewAssignmentStatusRequest;
    }) =>
      reviewAssignmentService.updateReviewAssignmentStatus(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["myReviewAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["review-assignments"] });
      queryClient.invalidateQueries({
        queryKey: ["review-assignments", "search"],
      });
      queryClient.invalidateQueries({ queryKey: ["submissionReviewers"] });
    },
  });
}

export function useCreateReviewAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      contentSubmissionId: number | string;
      reviewerUsrId: number | string;
      assignedByNotes?: string;
    }) => reviewAssignmentService.createReviewAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["review-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["submissionReviewers"] });
    },
  });
}
