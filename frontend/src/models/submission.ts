export interface Submission {
  submissionId: string | number;
  // legacy/alias id used by some frontend components
  id?: string | number;
  title: string;
  topics?: string[];
  abstract?: string | null;
  doi?: string | null;
  status?: number;
  statusUpdateNotes?: string | null;
  currentContentSubmissionVersionId?: string | number | null;
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
  abstract: string;
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

export enum ReviewRecommendation {
  ACCEPTED = 1,
  REJECTED = 2,
  NEEDS_REVISION = 3,
}

export const ReviewRecommendationLabel: Record<number, string> = {
  [ReviewRecommendation.ACCEPTED]: "Accepted",
  [ReviewRecommendation.REJECTED]: "Rejected",
  [ReviewRecommendation.NEEDS_REVISION]: "Needs Revision",
};

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

export enum MessageScope {
  USER_ADMIN = "USER_ADMIN",
  ADMIN_REVIEWER = "ADMIN_REVIEWER",
}

export interface SubmissionMessageSender {
  id?: string | number;
  email?: string;
  firstName?: string;
  lastName?: string;
  userType?: string;
}

export interface SubmissionMessage {
  messageId?: string | number;
  id?: string | number;
  message: string;
  content?: string;
  visibilityScope?: string;
  scope?: string;
  sender?: SubmissionMessageSender | null;
  receiver?: SubmissionMessageSender | null;
  senderUserId?: string | number;
  receiverUserId?: string | number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubmissionMessagesResponse {
  data: SubmissionMessage[];
  success: boolean;
}

export interface CreateSubmissionMessageRequest {
  message: string;
  scope: string;
  receiverUsrId?: string | number;
}

export interface SubmissionReviewer {
  id?: string | number;
  email?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  institution?: string;
  occupation?: string;
  country?: string;
  assignmentId?: string | number;
  assignmentStatus?: number;
  assignedAt?: string;
  assignedByUserId?: string | number;
  assignedByNotes?: string;
}

export interface SubmissionReviewersResponse {
  data: SubmissionReviewer[];
  success: boolean;
}

export interface SubmissionReviewReviewer {
  id?: string | number;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface SubmissionReview {
  reviewId?: string | number;
  createdAt?: string;
  comment?: string | null;
  recommendation?: number | null;
  contentReviewAssignmentId?: string | number;
  reviewer?: SubmissionReviewReviewer | null;
  version?: SubmissionVersion | null;
  reviewerVersion?: SubmissionVersion | null;
}

export interface SubmissionReviewsResponse {
  data: SubmissionReview[];
  success: boolean;
}

export interface CreateSubmissionReviewRequest {
  reviewerContentSubmissionVersionId?: string | number;
  recommendation: number;
  comment?: string | null;
}

export interface MessageGroup {
  recipient: SubmissionReviewer | null;
  messages: SubmissionMessage[];
  scope: string;
}

export interface MessageGroups {
  [key: string | number]: MessageGroup;
}
