export interface TrainingResponse {
  data: Training[];
  success: boolean;
  total: number;
  pagination?: {
    next?: {
      page: number;
      limit: number;
    };
    prev?: {
      page: number;
      limit: number;
    };
  };
}

export interface TrainingDetailsResponse {
  data: Training;
  success: boolean;
}

export interface Training {
  id: string | number;
  title: string;
  status: number;
  metadataFilePath?: string;
  createdAt: string;
  updatedAt: string;
}

export enum TrainingStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  DELETED = 9,
}

export interface GetTrainingsParams {
  page?: number;
  limit?: number;
  sort?: string;
  select?: string;
  search?: string;
  paginate?: boolean;
}

export interface CreateTrainingRequest {
  title: string;
  metadataFilePath: string;
  status: number;
}

export interface UpdateTrainingRequest {
  title: string;
  metadataFilePath: string;
  status: number;
}
