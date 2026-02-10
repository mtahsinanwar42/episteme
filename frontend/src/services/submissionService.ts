import { api } from "./api";
import type {
  SubmissionResponse,
  SubmissionDetailsResponse,
  CreateSubmissionRequest,
  UpdateSubmissionStatusRequest,
  SubmissionVersionsResponse,
  CreateSubmissionVersionRequest,
  SubmissionVersionDetailsResponse,
} from "@/models/submission";

export interface GetSubmissionsParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  paginate?: boolean;
  status?: number;
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
};
