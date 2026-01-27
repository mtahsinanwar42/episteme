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
  DRAFT: 0,
  PENDING_APPROVAL: 1,
  RETURNED: 2,
  APPROVED: 3,
  REJECTED: 4,
  DELETED: 9,
});
export const CONTENT_SUBMISSION_VERSION_INITIAL = CONTENT_SUBMISSION_STATUS.PENDING_APPROVAL;

export const CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE = Object.freeze({
  USER_ADMIN: "USER_ADMIN",
  ADMIN_REVIEWER: "ADMIN_REVIEWER",
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
  CANCELLED: 5,
  DELETED: 9,
});
export const REVIEW_RECOMMENDATION = Object.freeze({
  ACCEPTED: 1,
  REJECTED: 2,
  NEEDS_REVISION: 3,
});

export const CONTENT_SUBMISSION_PAYMENT_STATUS = Object.freeze({
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
  submissions: { visibility: "private", maxSize: 20_000_000, types: /docx|pdf/ },
  assets: { visibility: "public", maxSize: 5_000_000, types: /jpg|jpeg|png|svg|json/ },
};

export const REFERENCE_FILES = Object.freeze({
  TOPICS: "topics.txt",
  COUNTRIES: "countries.txt",
});

export const TOPICS_CONFIG = Object.freeze({
  URL: process.env.TOPICS_URL || "https://api.openalex.org/concepts",
  START_PAGE: 1,
  END_PAGE: 50,
  PER_PAGE: 200,
});

export const COUNTRIES_CONFIG = Object.freeze({
  URL:
    process.env.COUNTRIES_URL
    || "https://gist.githubusercontent.com/kalinchernev/486393efcca01623b18d/raw/countries",
});

export const DEFAULT_PAGE_NO = 1;
export const DEFAULT_PAGE_LIMIT = 10;

export const UPDATE_SCHEDULER_TIME_PATTERN = Object.freeze({
  TOPICS: "0 0 0 * * 0",
  COUNTRIES: "0 0 0 * * 0",
});

export const STATUS_UPDATE_NOTES = Object.freeze({
  SUBMISSION_DELETION_DUE_TO_CONF_DELETE: "Associated Conference was deleted; cascaded deletion to submissions.",
  SUBMISSION_DELETION_DUE_TO_CONF_FINISH: "Conference was finished; submission was auto-rejected.",
  REVIEW_ASSIGNMENT_DELETION_DUE_TO_SUBMISSION_DELETE: "Submission was deleted; cascaded deletion to review assignments.",
  REVIEW_ASSIGNMENT_DELETION_DUE_TO_CONF_DELETE: "Associated Conference was deleted; cascaded deletion to review assignments.",
  REVIEW_ASSIGNMENT_DELETION_DUE_TO_CONF_FINISH: "Conference was finished; assignment was auto-cancelled.",
  REVIEW_ASSIGNMENT_CANCELLATION_DUE_TO_SUBMISSION_ACCEPT_REJECT: "Submission was finalized (approved/rejected); assignment was auto-cancelled.",
});
