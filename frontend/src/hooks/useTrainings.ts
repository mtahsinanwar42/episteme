import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trainingService } from "@/services/trainingService";
import type {
  CreateTrainingRequest,
  UpdateTrainingRequest,
  GetTrainingsParams,
} from "@/models/training";

export function useTrainings(params?: GetTrainingsParams) {
  return useQuery({
    queryKey: ["trainings", params],
    queryFn: () => trainingService.getTrainings(params),
    staleTime: 30000, // 30 seconds
  });
}

export function useTrainingById(trainingId: string | number | undefined) {
  return useQuery({
    queryKey: ["training", trainingId],
    queryFn: () => trainingService.getTrainingById(trainingId!),
    enabled: !!trainingId,
    staleTime: 30000, // 30 seconds
  });
}

export function useCreateTrainingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTrainingRequest) =>
      trainingService.createTraining(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
    },
  });
}

export function useUpdateTrainingMutation(trainingId: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTrainingRequest) =>
      trainingService.updateTraining(trainingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      queryClient.invalidateQueries({ queryKey: ["training", trainingId] });
    },
  });
}
