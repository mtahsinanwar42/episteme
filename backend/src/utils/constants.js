export const USER_STATUS = Object.freeze({
  INACTIVE: 0,
  ACTIVE: 1,
  SUSPENDED: 2,
  DELETED: 9,
});
export const USER_ROLE = Object.freeze({
  USER: "USER",
  REVIEWER: "REVIEWER",
  ADMIN: "ADMIN",
});

export const CONFERENCE_STATUS = Object.freeze({
  INACTIVE: 0,
  ACTIVE: 1,
  FINISHED: 2,
  ARCHIVED: 3,
  DELETED: 9,
});

export const TRAINING_STATUS = Object.freeze({
  UPCOMING: 0,
  ONGOING: 1,
  COMPLETED: 2,
  DELETED: 9,
});

export const ANNOUNCEMENT_STATUS = Object.freeze({
  UPCOMING: 0,
  ONGOING: 1,
  COMPLETED: 2,
  DELETED: 9,
});

export const BLOG_STATUS = Object.freeze({
  DRAFT: 0,
  PUBLISHED: 1,
  DELETED: 9,
});

export const ACTIVITY_STATUS = Object.freeze({
  DRAFT: 0,
  PUBLISHED: 1,
  DELETED: 9,
});

export const CONTENT_SUBMISSION_STATUS = Object.freeze({
  PENDING_APPROVAL: 1,
  RETURNED: 2,
  APPROVED: 3,
  REJECTED: 4,
  DELETED: 9,
});

export const CONTENT_SUBMISSION_UPLOADER_USER_TYPE = Object.freeze({
  USER: "USER",
  REVIEWER: "REVIEWER",
  ADMIN: "ADMIN",
});

export const REVIEW_ASSIGNMENT_STATUS = Object.freeze({
  ASSIGNED: 1,
  ACCEPTED: 2,
  DECLINED: 3,
  COMPLETED: 4,
  OVERDUE: 5,
  DELETED: 9,
});
export const REVIEW_RECOMMENDATION = Object.freeze({
  ACCEPTED: 1,
  REJECTED: 2,
  NEEDS_REVISION: 3,
});

export const PAYMENT_STATUS = Object.freeze({
  PENDING: 0,
  AUTHORIZED: 1,
  CAPTURED: 2,
  FAILED: 3,
  REFUNDED: 4,
  CANCELLED: 5,
});

export const FILE_BUCKETS = {
  cvs: { visibility: "private", maxSize: 10_000_000, types: /docx|pdf/ },
  profile_photos: { visibility: "public", maxSize: 5_000_000, types: /jpg|jpeg|png/ },
  papers: { visibility: "private", maxSize: 20_000_000, types: /docx|pdf/ },
  assets: { visibility: "public", maxSize: 5_000_000, types: /jpg|jpeg|png|svg|json/ },
};

export const DEFAULT_PAGE_LIMIT = 10;