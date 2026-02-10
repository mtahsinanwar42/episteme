import { api } from "./api";
import type {
  ReviewAssignmentResponse,
  GetReviewAssignmentsParams,
  UpdateReviewAssignmentStatusRequest,
} from "@/models/reviewAssignment";

export const reviewAssignmentService = {
  getReviewAssignments: async (
    params?: GetReviewAssignmentsParams,
  ): Promise<ReviewAssignmentResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/review-assignments?${queryString}`
      : "/review-assignments";

    return api.get<ReviewAssignmentResponse>(endpoint, true);
  },

  getMyReviewAssignments: async (
    params?: GetReviewAssignmentsParams,
  ): Promise<ReviewAssignmentResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/review-assignments/me?${queryString}`
      : "/review-assignments/me";

    return api.get<ReviewAssignmentResponse>(endpoint, true);
  },

  updateReviewAssignmentStatus: async (
    assignmentId: number | string,
    data: UpdateReviewAssignmentStatusRequest,
  ): Promise<{ success: boolean; data: unknown }> => {
    return api.put(
      `/review-assignments/${assignmentId}/status`,
      data,
      true,
    );
  },
};
