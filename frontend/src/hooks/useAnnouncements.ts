import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { announcementService } from "@/services/announcementService";
import type {
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  GetAnnouncementsParams,
} from "@/models/announcement";

export function useAnnouncements(params?: GetAnnouncementsParams) {
  return useQuery({
    queryKey: ["announcements", params],
    queryFn: () => announcementService.getAnnouncements(params),
    staleTime: 30000, // 30 seconds
  });
}

export function useAnnouncementById(
  announcementId: string | number | undefined,
) {
  return useQuery({
    queryKey: ["announcement", announcementId],
    queryFn: () => announcementService.getAnnouncementById(announcementId!),
    enabled: !!announcementId,
    staleTime: 30000, // 30 seconds
  });
}

export function useCreateAnnouncementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementRequest) =>
      announcementService.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export function useUpdateAnnouncementMutation(announcementId: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAnnouncementRequest) =>
      announcementService.updateAnnouncement(announcementId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({
        queryKey: ["announcement", announcementId],
      });
    },
  });
}
