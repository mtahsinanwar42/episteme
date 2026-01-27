export interface ActivityResponse {
  data: Activity[];
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

export interface ActivityDetailsResponse {
  data: Activity;
  success: boolean;
}

export interface Activity {
  id: string | number;
  title: string;
  status: number;
  metadataFilePath?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ActivityStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  DELETED = 9,
}

export interface GetActivitiesParams {
  page?: number;
  limit?: number;
  sort?: string;
  select?: string;
  search?: string;
  paginate?: boolean;
}

export interface CreateActivityRequest {
  title: string;
  metadataFilePath: string;
  status: number;
}
