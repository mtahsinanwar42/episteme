export interface ReviewAssignment {
  assignmentId: number;
  submissionId: number;
  reviewerUserId: number;
  assignmentStatus: number;
  assignmentStatusUpdateNotes: string | null;
  assignedAt: string;
  dueAt: string;
  assignedByUserId: number;
  assignedByNotes: string | null;

  submissionTitle: string;
  conferenceId: number;
  submissionStatus: number;
  submissionCreatedAt: string;
  submissionUpdatedAt: string;

  conferenceTitle: string;
  conferenceStatus: number;

  reviewerEmail: string;
  reviewerFirstName: string;
  reviewerLastName: string;

  assignedByEmail: string;
  assignedByFirstName: string;
  assignedByLastName: string;

  ownerEmail: string;
  ownerFirstName: string;
  ownerLastName: string;
}

export interface ReviewAssignmentResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  data: ReviewAssignment[];
}

export interface UpdateReviewAssignmentStatusRequest {
  status: number;
  statusUpdateNotes?: string;
}

export interface GetReviewAssignmentsParams {
  page?: number;
  limit?: number;
}

export enum ReviewAssignmentStatus {
  ASSIGNED = 1,
  ACCEPTED = 2,
  DECLINED = 3,
  COMPLETED = 4,
  CANCELLED = 5,
  OVERDUE = 6,
  DELETED = 9,
}

export const ReviewAssignmentStatusLabel: Record<number, string> = {
  [ReviewAssignmentStatus.ASSIGNED]: "Assigned",
  [ReviewAssignmentStatus.ACCEPTED]: "Accepted",
  [ReviewAssignmentStatus.DECLINED]: "Declined",
  [ReviewAssignmentStatus.COMPLETED]: "Completed",
  [ReviewAssignmentStatus.CANCELLED]: "Cancelled",
  [ReviewAssignmentStatus.OVERDUE]: "Overdue",
  [ReviewAssignmentStatus.DELETED]: "Deleted",
};

export enum ContentSubmissionStatus {
  DRAFT = 0,
  PENDING_APPROVAL = 1,
  RETURNED = 2,
  APPROVED = 3,
  REJECTED = 4,
  DELETED = 9,
}

export const ContentSubmissionStatusLabel: Record<number, string> = {
  [ContentSubmissionStatus.DRAFT]: "Draft",
  [ContentSubmissionStatus.PENDING_APPROVAL]: "Pending Approval",
  [ContentSubmissionStatus.RETURNED]: "Returned",
  [ContentSubmissionStatus.APPROVED]: "Approved",
  [ContentSubmissionStatus.REJECTED]: "Rejected",
  [ContentSubmissionStatus.DELETED]: "Deleted",
};
