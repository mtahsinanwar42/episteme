import { api } from "./api";
import type {
  NotificationResponse,
  NotificationStatusResponse,
  MarkAsReadResponse,
} from "@/models/notification";

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
}

export const notificationService = {
  getNotifications: async (
    params?: GetNotificationsParams,
  ): Promise<NotificationResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/notifications?${queryString}`
      : "/notifications";

    return api.get<NotificationResponse>(endpoint, true);
  },

  getStatus: async (): Promise<NotificationStatusResponse> => {
    return api.get<NotificationStatusResponse>("/notifications/status", true);
  },

  markAsRead: async (notificationIds: number[]): Promise<MarkAsReadResponse> => {
    return api.post<MarkAsReadResponse>(
      "/notifications/read",
      { notificationIds },
      true,
    );
  },
};
