import { api } from "./api";
import type {
  AnnouncementResponse,
  AnnouncementDetailsResponse,
  GetAnnouncementsParams,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from "@/models/announcement";

export const announcementService = {
  getAnnouncements: async (
    params?: GetAnnouncementsParams,
  ): Promise<AnnouncementResponse> => {
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
    const endpoint = queryString
      ? `/announcements?${queryString}`
      : "/announcements";

    return api.get<AnnouncementResponse>(endpoint, false);
  },

  getAnnouncementById: async (
    announcementId: string | number,
  ): Promise<AnnouncementDetailsResponse> => {
    return api.get<AnnouncementDetailsResponse>(
      `/announcements/${announcementId}`,
      false,
    );
  },

  createAnnouncement: async (
    data: CreateAnnouncementRequest,
  ): Promise<AnnouncementDetailsResponse> => {
    return api.post<AnnouncementDetailsResponse>("/announcements", data, true);
  },

  updateAnnouncement: async (
    announcementId: string | number,
    data: UpdateAnnouncementRequest,
  ): Promise<AnnouncementDetailsResponse> => {
    return api.put<AnnouncementDetailsResponse>(
      `/announcements/${announcementId}`,
      data,
      true,
    );
  },
};
