import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { activityService } from "@/services/activityService";
import type {
  CreateActivityRequest,
  GetActivitiesParams,
} from "@/models/activity";

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

export function useCreateActivityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityRequest) =>
      activityService.createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}
