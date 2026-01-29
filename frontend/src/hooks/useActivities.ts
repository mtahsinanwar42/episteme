import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { activityService } from "@/services/activityService";
import type {
  CreateActivityRequest,
  UpdateActivityRequest,
  GetActivitiesParams,
} from "@/models/activity";

export function useActivities(params?: GetActivitiesParams) {
  return useQuery({
    queryKey: ["activities", params],
    queryFn: () => activityService.getActivities(params),
  });
}

export function useActivityById(activityId: string | number | undefined) {
  return useQuery({
    queryKey: ["activity", activityId],
    queryFn: () => activityService.getActivityById(activityId!),
    enabled: !!activityId,
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

export function useUpdateActivityMutation(activityId: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateActivityRequest) =>
      activityService.updateActivity(activityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["activity", activityId] });
    },
  });
}
