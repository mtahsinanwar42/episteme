export interface ConferenceResponse {
  data: Conference[];
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

export interface ConferenceDetailsResponse {
  data: Conference;
  success: boolean;
}

export interface ConferencePublicationsResponse {
  data: ConferencePublication[];
  success: boolean;
  page: number;
  limit: number;
  total: number;
}

export interface Conference {
  id: string | number;
  title: string;
  slug: string;
  startAt: string;
  endAt: string;
  submissionPeriodStartAt: string;
  submissionPeriodEndAt: string;
  status: number;
  metadataFilePath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConferencePublication {
  submissionId: string | number;
  title: string;
  topics: string[];
  doi?: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string | number;
  authorEmail: string;
  authorFirstName: string;
  authorLastName: string;
  authorInstitution?: string | null;
  authorOccupation?: string | null;
  authorCountry?: string | null;
  fileId: string | number;
  fileName: string;
  storageKey: string;
  conferenceId: string | number;
  conferenceTitle: string;
  conferenceSlug: string;
  conferenceStatus: number;
}

export enum ConferenceStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  FINISHED = 2,
  DELETED = 9,
}

export const ConferenceStatusLabel: Record<number, string> = {
  [ConferenceStatus.INACTIVE]: "Inactive",
  [ConferenceStatus.ACTIVE]: "Active",
  [ConferenceStatus.FINISHED]: "Finished",
  [ConferenceStatus.DELETED]: "Deleted",
};

export interface GetConferencesParams {
  page?: number;
  limit?: number;
  sort?: string;
  select?: string;
  search?: string;
  paginate?: boolean;
  title?: string;
  slug?: string;
  status?: number;
  statusIn?: string;
  startAtFrom?: string;
  startAtTo?: string;
  submissionStartAtFrom?: string;
  submissionStartAtTo?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
}

export interface CreateConferenceRequest {
  title: string;
  slug: string;
  startAt: string;
  endAt: string;
  submissionPeriodStartAt: string;
  submissionPeriodEndAt: string;
  metadataFilePath: string;
  status: number;
}

export interface UpdateConferenceRequest {
  title: string;
  slug: string;
  startAt: string;
  endAt: string;
  submissionPeriodStartAt: string;
  submissionPeriodEndAt: string;
  metadataFilePath: string;
  status: number;
}

export interface UpdateConferenceStatusRequest {
  status: number;
}
