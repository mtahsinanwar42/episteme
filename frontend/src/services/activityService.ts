import { api } from "./api";
import type { ActivityResponse, ActivityDetailsResponse } from "@/models/activity";

export interface GetActivitiesParams {
  page?: number;
  limit?: number;
  sort?: string;
  select?: string;
  search?: string;
  paginate?: boolean;
}

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
};
