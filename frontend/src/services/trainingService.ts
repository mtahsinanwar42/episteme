import { api } from "./api";
import type {
  TrainingResponse,
  TrainingDetailsResponse,
  GetTrainingsParams,
  CreateTrainingRequest,
  UpdateTrainingRequest,
} from "@/models/training";

export const trainingService = {
  getTrainings: async (
    params?: GetTrainingsParams,
  ): Promise<TrainingResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.select) queryParams.append("select", params.select);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status !== undefined)
      queryParams.append("status", params.status.toString());
    if (params?.statusIn)
      queryParams.append("status[in]", params.statusIn);
    if (params?.paginate !== undefined)
      queryParams.append("paginate", params.paginate.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/trainings?${queryString}` : "/trainings";

    return api.get<TrainingResponse>(endpoint, false);
  },

  getTrainingById: async (
    trainingId: string | number,
  ): Promise<TrainingDetailsResponse> => {
    return api.get<TrainingDetailsResponse>(`/trainings/${trainingId}`, false);
  },

  createTraining: async (
    data: CreateTrainingRequest,
  ): Promise<TrainingDetailsResponse> => {
    return api.post<TrainingDetailsResponse>("/trainings", data, true);
  },

  updateTraining: async (
    trainingId: string | number,
    data: UpdateTrainingRequest,
  ): Promise<TrainingDetailsResponse> => {
    return api.put<TrainingDetailsResponse>(
      `/trainings/${trainingId}`,
      data,
      true,
    );
  },
};
