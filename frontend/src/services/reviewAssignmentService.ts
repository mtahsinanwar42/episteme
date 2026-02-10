import { api } from "./api";
import type {
  ReviewAssignmentResponse,
  GetReviewAssignmentsParams,
  UpdateReviewAssignmentStatusRequest,
} from "@/models/reviewAssignment";

export interface SearchReviewAssignmentsParams {
  page?: number;
  limit?: number;
  submissionTitle?: string;
  submissionStatuses?: number[];
  submissionOwnerUsrIds?: number[];
  conferenceId?: number;
  assignmentStatuses?: number[];
  assignedByUsrIds?: number[];
  reviewerUsrIds?: number[];
  assignedDateFrom?: string;
  assignedDateTo?: string;
}

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

  searchReviewAssignments: async (
    params?: SearchReviewAssignmentsParams,
  ): Promise<ReviewAssignmentResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.submissionTitle) {
      queryParams.append("submissionTitle", params.submissionTitle);
    }
    if (params?.conferenceId !== undefined) {
      queryParams.append("conferenceId", params.conferenceId.toString());
    }
    if (params?.submissionStatuses?.length) {
      queryParams.append(
        "submissionStatuses",
        params.submissionStatuses.join(","),
      );
    }
    if (params?.submissionOwnerUsrIds?.length) {
      queryParams.append(
        "submissionOwnerUsrIds",
        params.submissionOwnerUsrIds.join(","),
      );
    }
    if (params?.assignmentStatuses?.length) {
      queryParams.append(
        "assignmentStatuses",
        params.assignmentStatuses.join(","),
      );
    }
    if (params?.assignedByUsrIds?.length) {
      queryParams.append("assignedByUsrIds", params.assignedByUsrIds.join(","));
    }
    if (params?.reviewerUsrIds?.length) {
      queryParams.append("reviewerUsrIds", params.reviewerUsrIds.join(","));
    }
    if (params?.assignedDateFrom) {
      queryParams.append("assignedDateFrom", params.assignedDateFrom);
    }
    if (params?.assignedDateTo) {
      queryParams.append("assignedDateTo", params.assignedDateTo);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/review-assignments/search?${queryString}`
      : "/review-assignments/search";

    return api.get<ReviewAssignmentResponse>(endpoint, true);
  },
};
