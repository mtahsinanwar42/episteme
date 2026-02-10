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

export enum SubmissionStatus {
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

export interface SubmissionVersionUploader {
  id?: string | number;
  email?: string;
  firstName?: string;
  lastName?: string;
  userType?: string;
}

export interface SubmissionVersionFile {
  id?: string | number;
  name?: string;
  storageKey?: string;
}

export interface SubmissionVersion {
  versionId?: string | number;
  versionNo?: number | string;
  changeLog?: string | null;
  createdAt?: string;
  uploader?: SubmissionVersionUploader | null;
  file?: SubmissionVersionFile | null;
}

export interface SubmissionVersionsResponse {
  data: SubmissionVersion[];
  success: boolean;
}

export interface SubmissionVersionDetailsResponse {
  data: SubmissionVersion;
  success: boolean;
}

export interface CreateSubmissionVersionRequest {
  contentFilePath: string;
  message?: string;
}
