import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewAssignmentService } from "@/services/reviewAssignmentService";
import type {
  GetReviewAssignmentsParams,
  UpdateReviewAssignmentStatusRequest,
} from "@/models/reviewAssignment";

export function useReviewAssignments(params?: GetReviewAssignmentsParams) {
  return useQuery({
    queryKey: ["reviewAssignments", params],
    queryFn: () => reviewAssignmentService.getReviewAssignments(params),
  });
}

export function useMyReviewAssignments(params?: GetReviewAssignmentsParams) {
  return useQuery({
    queryKey: ["myReviewAssignments", params],
    queryFn: () => reviewAssignmentService.getMyReviewAssignments(params),
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
    }) => reviewAssignmentService.updateReviewAssignmentStatus(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["myReviewAssignments"] });
    },
  });
}
