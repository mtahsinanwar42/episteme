import { api } from "./api";
import type {
  ConferenceDetailsResponse,
  ConferencePublicationsResponse,
  ConferenceResponse,
  CreateConferenceRequest,
  GetConferencesParams,
  UpdateConferenceRequest,
  UpdateConferenceStatusRequest,
} from "@/models/conference";

export const conferenceService = {
  getConferences: async (
    params?: GetConferencesParams,
  ): Promise<ConferenceResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.select) queryParams.append("select", params.select);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.title) queryParams.append("title[iLike]", params.title);
    if (params?.slug) queryParams.append("slug[iLike]", params.slug);
    if (params?.status !== undefined)
      queryParams.append("status", params.status.toString());
    if (params?.statusIn)
      queryParams.append("status[in]", params.statusIn);
    if (params?.startAtFrom)
      queryParams.append("startAt[gte]", params.startAtFrom);
    if (params?.startAtTo)
      queryParams.append("startAt[lte]", `${params.startAtTo}T23:59:59`);
    if (params?.submissionStartAtFrom)
      queryParams.append(
        "submissionPeriodStartAt[gte]",
        params.submissionStartAtFrom,
      );
    if (params?.submissionStartAtTo)
      queryParams.append(
        "submissionPeriodStartAt[lte]",
        `${params.submissionStartAtTo}T23:59:59`,
      );
    if (params?.createdAtFrom)
      queryParams.append("createdAt[gte]", params.createdAtFrom);
    if (params?.createdAtTo)
      queryParams.append("createdAt[lte]", `${params.createdAtTo}T23:59:59`);
    if (params?.paginate !== undefined)
      queryParams.append("paginate", params.paginate.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/conferences?${queryString}`
      : "/conferences";

    return api.get<ConferenceResponse>(endpoint, false);
  },

  getConferenceById: async (
    conferenceId: string | number | undefined,
  ): Promise<ConferenceDetailsResponse> => {
    if (!conferenceId) {
      throw new Error("Conference ID is required");
    }

    return api.get<ConferenceDetailsResponse>(
      `/conferences/${conferenceId}`,
      false,
    );
  },

  getConferencePublications: async (
    conferenceId: string | number | undefined,
    params?: { page?: number; limit?: number },
  ): Promise<ConferencePublicationsResponse> => {
    if (!conferenceId) {
      throw new Error("Conference ID is required");
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/conferences/${conferenceId}/publications?${queryString}`
      : `/conferences/${conferenceId}/publications`;

    return api.get<ConferencePublicationsResponse>(endpoint, false);
  },

  createConference: async (
    data: CreateConferenceRequest,
  ): Promise<ConferenceDetailsResponse> => {
    return api.post<ConferenceDetailsResponse>("/conferences", data, true);
  },

  updateConference: async (
    conferenceId: string | number,
    data: UpdateConferenceRequest,
  ): Promise<ConferenceDetailsResponse> => {
    return api.put<ConferenceDetailsResponse>(
      `/conferences/${conferenceId}`,
      data,
      true,
    );
  },

  updateConferenceStatus: async (
    conferenceId: string | number,
    data: UpdateConferenceStatusRequest,
  ): Promise<ConferenceDetailsResponse> => {
    return api.put<ConferenceDetailsResponse>(
      `/conferences/${conferenceId}/status`,
      data,
      true,
    );
  },
};
