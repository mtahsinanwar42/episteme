export interface AnnouncementResponse {
  data: Announcement[];
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

export interface AnnouncementDetailsResponse {
  data: Announcement;
  success: boolean;
}

export interface Announcement {
  id: string | number;
  title: string;
  status: number;
  metadataFilePath?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AnnouncementStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  DELETED = 9,
}

export interface GetAnnouncementsParams {
  page?: number;
  limit?: number;
  sort?: string;
  select?: string;
  search?: string;
  paginate?: boolean;
}

export interface CreateAnnouncementRequest {
  title: string;
  metadataFilePath: string;
  status: number;
}

export interface UpdateAnnouncementRequest {
  title: string;
  metadataFilePath: string;
  status: number;
}
