import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  notificationService,
  type GetNotificationsParams,
} from "@/services/notificationService";

export function useNotificationStatus(enabled: boolean = true) {
  return useQuery({
    queryKey: ["notificationStatus"],
    queryFn: () => notificationService.getStatus(),
    enabled,
    refetchInterval: enabled ? 30000 : false,
  });
}

export function useNotifications(
  params?: GetNotificationsParams,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationService.getNotifications(params),
    enabled,
    refetchInterval: enabled ? 30000 : false,
  });
}

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds: number[]) =>
      notificationService.markAsRead(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationStatus"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
