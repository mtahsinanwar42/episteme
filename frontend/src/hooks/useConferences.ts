import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conferenceService } from "@/services/conferenceService";
import type {
  CreateConferenceRequest,
  GetConferencesParams,
  UpdateConferenceRequest,
  UpdateConferenceStatusRequest,
} from "@/models/conference";

export function useConferences(params?: GetConferencesParams) {
  return useQuery({
    queryKey: ["conferences", params],
    queryFn: () => conferenceService.getConferences(params),
  });
}

export function useConferenceById(conferenceId: string | number | undefined) {
  return useQuery({
    queryKey: ["conference", conferenceId],
    queryFn: () => conferenceService.getConferenceById(conferenceId!),
    enabled: !!conferenceId,
  });
}

export function useConferencePublications(
  conferenceId: string | number | undefined,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: ["conferencePublications", conferenceId, params],
    queryFn: () =>
      conferenceService.getConferencePublications(conferenceId!, params),
    enabled: !!conferenceId,
  });
}

export function useCreateConferenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConferenceRequest) =>
      conferenceService.createConference(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conferences"] });
    },
  });
}

export function useUpdateConferenceMutation(conferenceId: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateConferenceRequest) =>
      conferenceService.updateConference(conferenceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conferences"] });
      queryClient.invalidateQueries({ queryKey: ["conference", conferenceId] });
    },
  });
}

export function useUpdateConferenceStatusMutation(
  conferenceId: string | number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateConferenceStatusRequest) =>
      conferenceService.updateConferenceStatus(conferenceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conferences"] });
      queryClient.invalidateQueries({ queryKey: ["conference", conferenceId] });
    },
  });
}
