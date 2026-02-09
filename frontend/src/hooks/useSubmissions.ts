import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  submissionService,
  type GetSubmissionsParams,
} from "@/services/submissionService";
import type { CreateSubmissionRequest } from "@/models/submission";

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
