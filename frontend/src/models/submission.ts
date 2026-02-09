export interface Submission {
  submissionId: string | number;
  // legacy/alias id used by some frontend components
  id?: string | number;
  title: string;
  topics?: string[];
  doi?: string | null;
  status?: number;
  statusUpdateNotes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  conferenceId?: string | number;
  conferenceTitle?: string;
  conferenceSlug?: string;
  conferenceStatus?: number;
  paymentStatus?: number;
  ownerUserId?: string | number;
  ownerEmail?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
  ownerInstitution?: string;
  ownerOccupation?: string;
  ownerCountry?: string;
  version?: {
    id: string | number;
    changeLog?: string;
    filePath?: string;
    createdAt?: string;
    versionNo?: number | string;
  };
}

export interface SubmissionResponse {
  data: Submission[];
  success: boolean;
  page?: number;
  limit?: number;
  total: number;
  // keep legacy pagination shape if present
  pagination?: {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
  };
}

export interface SubmissionDetailsResponse {
  data: Submission;
  success: boolean;
}

export interface CreateSubmissionRequest {
  title: string;
  conferenceId: string | number;
  topics?: string[];
  contentFilePath: string;
  message?: string;
}

export enum ContentSubmissionStatus {
  DRAFT = 0,
  PENDING_APPROVAL = 1,
  RETURNED = 2,
  APPROVED = 3,
  REJECTED = 4,
  DELETED = 9,
}

export interface UpdateSubmissionStatusRequest {
  status: number;
  statusUpdateNotes?: string;
}
