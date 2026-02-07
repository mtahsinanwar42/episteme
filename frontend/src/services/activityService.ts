import { api } from "./api";
import type {
  ActivityResponse,
  ActivityDetailsResponse,
  GetActivitiesParams,
  CreateActivityRequest,
  UpdateActivityRequest,
} from "@/models/activity";

export const activityService = {
  getActivities: async (
    params?: GetActivitiesParams,
  ): Promise<ActivityResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.select) queryParams.append("select", params.select);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status !== undefined)
      queryParams.append("status", params.status.toString());
    if (params?.statusIn)
      queryParams.append("status[in]", params.statusIn);
    if (params?.title) queryParams.append("title[iLike]", params.title);
    if (params?.createdAtFrom)
      queryParams.append("createdAt[gte]", params.createdAtFrom);
    if (params?.createdAtTo)
      queryParams.append("createdAt[lte]", `${params.createdAtTo}T23:59:59`);
    if (params?.paginate !== undefined)
      queryParams.append("paginate", params.paginate.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/activities?${queryString}` : "/activities";

    // Activities list is public in backend routes (no auth required)
    return api.get<ActivityResponse>(endpoint, false);
  },

  getActivityById: async (
    activityId: string | number,
  ): Promise<ActivityDetailsResponse> => {
    return api.get<ActivityDetailsResponse>(`/activities/${activityId}`, false);
  },

  createActivity: async (
    data: CreateActivityRequest,
  ): Promise<ActivityDetailsResponse> => {
    return api.post<ActivityDetailsResponse>("/activities", data, true);
  },

  updateActivity: async (
    activityId: string | number,
    data: UpdateActivityRequest,
  ): Promise<ActivityDetailsResponse> => {
    return api.put<ActivityDetailsResponse>(
      `/activities/${activityId}`,
      data,
      true,
    );
  },
};
