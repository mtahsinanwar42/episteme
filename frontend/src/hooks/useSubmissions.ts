import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  submissionService,
  type GetSubmissionsParams,
} from "@/services/submissionService";
import type {
  CreateSubmissionRequest,
  UpdateSubmissionStatusRequest,
  CreateSubmissionVersionRequest,
  CreateSubmissionMessageRequest,
  CreateSubmissionReviewRequest,
} from "@/models/submission";

export function useSubmissions(params?: GetSubmissionsParams) {
  return useQuery({
    queryKey: ["submissions", params],
    queryFn: () => submissionService.getSubmissions(params),
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

export function useUpdateSubmissionDoiMutation(submissionId: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { doi: string }) =>
      submissionService.updateSubmissionDoi(submissionId, data),
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

export function useSubmissionMessages(submissionId?: string | number) {
  return useQuery({
    queryKey: ["submissionMessages", submissionId],
    queryFn: () => submissionService.getSubmissionMessages(submissionId!),
    enabled: !!submissionId,
  });
}

export function useCreateSubmissionMessageMutation(
  submissionId: string | number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubmissionMessageRequest) =>
      submissionService.createSubmissionMessage(submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["submissionMessages", submissionId],
      });
    },
  });
}

export function useSubmissionReviewers(
  submissionId?: string | number,
  options?: { enabled?: boolean; paginate?: boolean },
) {
  return useQuery({
    queryKey: ["submissionReviewers", submissionId, options?.paginate],
    queryFn: () =>
      submissionService.getSubmissionReviewers(submissionId!, {
        paginate: options?.paginate,
      }),
    enabled:
      options?.enabled !== undefined
        ? options.enabled && !!submissionId
        : !!submissionId,
  });
}

export function useSubmissionReviews(
  submissionId?: string | number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["submissionReviews", submissionId],
    queryFn: () => submissionService.getSubmissionReviews(submissionId!),
    enabled:
      options?.enabled !== undefined
        ? options.enabled && !!submissionId
        : !!submissionId,
  });
}

export function useCreateSubmissionReviewMutation(
  submissionId: string | number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubmissionReviewRequest) =>
      submissionService.createSubmissionReview(submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["submissionReviews", submissionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["myReviewAssignments"],
      });
    },
  });
}

export function useReviewAssignments(params?: GetSubmissionsParams) {
  return useQuery({
    queryKey: ["reviewssignments", params],
    queryFn: () => submissionService.getReviewAssignments(params),
  });
}
