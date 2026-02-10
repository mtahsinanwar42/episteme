import { api } from "./api";
import type {
  SubmissionResponse,
  SubmissionDetailsResponse,
  CreateSubmissionRequest,
  UpdateSubmissionStatusRequest,
  SubmissionVersionsResponse,
  CreateSubmissionVersionRequest,
  SubmissionVersionDetailsResponse,
  SubmissionMessagesResponse,
  CreateSubmissionMessageRequest,
  SubmissionReviewersResponse,
  SubmissionMessage,
} from "@/models/submission";

export interface GetSubmissionsParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  paginate?: boolean;
  status?: number;
}

export interface SearchSubmissionsParams {
  page?: number;
  limit?: number;
  title?: string;
  topics?: string[];
  doi?: string;
  conferenceId?: number;
  status?: number[];
  ownerUsrIds?: number[];
  createdDateFrom?: string;
  createdDateTo?: string;
}

export const submissionService = {
  getSubmissions: async (
    params?: GetSubmissionsParams,
  ): Promise<SubmissionResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.paginate !== undefined)
      queryParams.append("paginate", params.paginate.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/submissions?${queryString}`
      : "/submissions";

    return api.get<SubmissionResponse>(endpoint, true);
  },

  getSubmissionById: async (
    submissionId: string | number,
  ): Promise<SubmissionDetailsResponse> => {
    return api.get<SubmissionDetailsResponse>(
      `/submissions/${submissionId}`,
      true,
    );
  },

  createSubmission: async (
    data: CreateSubmissionRequest,
  ): Promise<SubmissionDetailsResponse> => {
    return api.post<SubmissionDetailsResponse>("/submissions", data, true);
  },

  updateSubmissionStatus: async (
    submissionId: string | number,
    data: UpdateSubmissionStatusRequest,
  ): Promise<SubmissionDetailsResponse> => {
    return api.put<SubmissionDetailsResponse>(
      `/submissions/${submissionId}/status`,
      data,
      true,
    );
  },

  getSubmissionVersions: async (
    submissionId: string | number,
  ): Promise<SubmissionVersionsResponse> => {
    return api.get<SubmissionVersionsResponse>(
      `/submissions/${submissionId}/versions`,
      true,
    );
  },

  createSubmissionVersion: async (
    submissionId: string | number,
    data: CreateSubmissionVersionRequest,
  ): Promise<SubmissionVersionDetailsResponse> => {
    return api.post<SubmissionVersionDetailsResponse>(
      `/submissions/${submissionId}/versions`,
      data,
      true,
    );
  },

  getSubmissionMessages: async (
    submissionId: string | number,
  ): Promise<SubmissionMessagesResponse> => {
    return api.get<SubmissionMessagesResponse>(
      `/submissions/${submissionId}/messages`,
      true,
    );
  },

  createSubmissionMessage: async (
    submissionId: string | number,
    data: CreateSubmissionMessageRequest,
  ): Promise<SubmissionMessage> => {
    return api.post<SubmissionMessage>(
      `/submissions/${submissionId}/messages`,
      data,
      true,
    );
  },

  getSubmissionReviewers: async (
    submissionId: string | number,
  ): Promise<SubmissionReviewersResponse> => {
    return api.get<SubmissionReviewersResponse>(
      `/submissions/${submissionId}/reviewers`,
      true,
    );
  },

  getReviewAssignments: async (
    params?: GetSubmissionsParams,
  ): Promise<SubmissionResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.paginate !== undefined)
      queryParams.append("paginate", params.paginate.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/review-assignments/me?${queryString}`
      : "/review-assignments/me";

    return api.get<SubmissionResponse>(endpoint, true);
  },

  searchSubmissions: async (
    params?: SearchSubmissionsParams,
  ): Promise<SubmissionResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.title) queryParams.append("title", params.title);
    if (params?.doi) queryParams.append("doi", params.doi);
    if (params?.conferenceId !== undefined) {
      queryParams.append("conferenceId", params.conferenceId.toString());
    }
    if (params?.topics?.length) {
      queryParams.append("topics", JSON.stringify(params.topics));
    }
    if (params?.status?.length) {
      queryParams.append("status", params.status.join(","));
    }
    if (params?.ownerUsrIds?.length) {
      queryParams.append("ownerUsrIds", params.ownerUsrIds.join(","));
    }
    if (params?.createdDateFrom) {
      queryParams.append("createdDateFrom", params.createdDateFrom);
    }
    if (params?.createdDateTo) {
      queryParams.append("createdDateTo", params.createdDateTo);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/submissions/search?${queryString}`
      : "/submissions/search";

    return api.get<SubmissionResponse>(endpoint, true);
  },
};
