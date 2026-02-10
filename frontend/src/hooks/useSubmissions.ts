import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  submissionService,
  type GetSubmissionsParams,
} from "@/services/submissionService";
import type {
  CreateSubmissionRequest,
  UpdateSubmissionStatusRequest,
  CreateSubmissionVersionRequest,
} from "@/models/submission";

export function useSubmissions(params?: GetSubmissionsParams) {
  return useQuery({
    queryKey: ["submissions", params],
    queryFn: () => submissionService.getSubmissions(),
  });
}

export function useSubmissionById(submissionId?: string | number) {
  return useQuery({
    queryKey: ["submission", submissionId],
    queryFn: () => submissionService.getSubmissionById(submissionId!),
    enabled: !!submissionId,
  });
}

export function useCreateSubmissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubmissionRequest) =>
      submissionService.createSubmission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

export function useUpdateSubmissionStatusMutation(
  submissionId: string | number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSubmissionStatusRequest) =>
      submissionService.updateSubmissionStatus(submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submission", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

export function useSubmissionVersions(submissionId?: string | number) {
  return useQuery({
    queryKey: ["submissionVersions", submissionId],
    queryFn: () => submissionService.getSubmissionVersions(submissionId!),
    enabled: !!submissionId,
  });
}

export function useCreateSubmissionVersionMutation(
  submissionId: string | number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubmissionVersionRequest) =>
      submissionService.createSubmissionVersion(submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["submissionVersions", submissionId],
      });
      queryClient.invalidateQueries({ queryKey: ["submission", submissionId] });
    },
  });
}
