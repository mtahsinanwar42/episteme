import { useQuery } from "@tanstack/react-query";
import { activityService, type GetActivitiesParams } from "@/services/activityService";

export function useActivities(params?: GetActivitiesParams) {
  return useQuery({
    queryKey: ["activities", params],
    queryFn: () => activityService.getActivities(params),
    staleTime: 30000, // 30 seconds
  });
}

export function useActivityById(activityId: string | number | undefined) {
  return useQuery({
    queryKey: ["activity", activityId],
    queryFn: () => activityService.getActivityById(activityId!),
    enabled: !!activityId,
    staleTime: 30000, // 30 seconds
  });
}
