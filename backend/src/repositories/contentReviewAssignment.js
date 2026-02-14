import { QueryTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { REVIEW_ASSIGNMENT_STATUS, DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_NO, CONTENT_SUBMISSION_STATUS, CONTENT_SUBMISSION_PAYMENT_STATUS, USER_ROLE, CONFERENCE_STATUS } from "../utils/constants.js";

const GET_REVIEW_ASSIGNMENTS_BASE_SELECT = `
  SELECT
    COUNT(*) OVER()           AS "total",
    CRA.id                    AS "assignmentId",
    CRA.content_submission_id AS "submissionId",
    CRA.reviewer_usr_id       AS "reviewerUserId",
    CRA.status                AS "assignmentStatus",
    CRA.status_update_notes   AS "assignmentStatusUpdateNotes",
    CRA.assigned_at           AS "assignedAt",
    CRA.assigned_by_usr_id    AS "assignedByUserId",
    CRA.assigned_by_notes     AS "assignedByNotes",

    CS.title                  AS "submissionTitle",
    CS.conference_id          AS "conferenceId",
    CS.current_status         AS "submissionStatus",
    CS.created_at             AS "submissionCreatedAt",
    CS.updated_at             AS "submissionUpdatedAt",

    CONF.title                AS "conferenceTitle",
    CONF.status               AS "conferenceStatus",

    REV.email                 AS "reviewerEmail",
    REV.first_name            AS "reviewerFirstName",
    REV.last_name             AS "reviewerLastName",

    AB.email                  AS "assignedByEmail",
    AB.first_name             AS "assignedByFirstName",
    AB.last_name              AS "assignedByLastName",

    OW.email                  AS "ownerEmail",
    OW.first_name             AS "ownerFirstName",
    OW.last_name              AS "ownerLastName"
`;

const GET_REVIEW_ASSIGNMENTS_BASE_FROM_JOINS = `
  FROM episteme.content_review_assignment CRA
  JOIN episteme.content_submission CS
    ON CS.id = CRA.content_submission_id

  JOIN episteme.user REV
    ON REV.id = CRA.reviewer_usr_id

  JOIN episteme.user AB
    ON AB.id = CRA.assigned_by_usr_id

  JOIN episteme.user OW
    ON OW.id = CS.owner_usr_id

  JOIN episteme.conference CONF
    ON CONF.id = CS.conference_id
`;

export async function findReviewAssignmentsByUserId({
  userId,
  page,
  limit,
}) {
  const pageNum = Math.max(1, Number(page) || DEFAULT_PAGE_NO);
  const limitNum = Math.max(1, Math.max(1, Number(limit) || DEFAULT_PAGE_LIMIT));
  const offset = (pageNum - 1) * limitNum;

  const sql = `
    ${GET_REVIEW_ASSIGNMENTS_BASE_SELECT}
    ${GET_REVIEW_ASSIGNMENTS_BASE_FROM_JOINS}
    WHERE
      CRA.reviewer_usr_id = :reviewerUserId
      AND CRA.status <> :deletedStatus
    ORDER BY CRA.assigned_at DESC
    LIMIT :limit OFFSET :offset;
  `;

  const rows = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: {
      reviewerUserId: Number(userId),
      deletedStatus: REVIEW_ASSIGNMENT_STATUS.DELETED,
      limit: limitNum,
      offset,
    },
  });

  return {
    page: pageNum,
    limit: limitNum,
    total: rows.length ? Number(rows[0].total) : 0,
    data: rows.map(({ total, ...row }) => row),
  };
}
export async function findReviewAssignments({ page, limit }) {
  const pageNum = Math.max(1, Number(page) || DEFAULT_PAGE_NO);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || DEFAULT_PAGE_LIMIT));
  const offset = (pageNum - 1) * limitNum;

  const sql = `
    ${GET_REVIEW_ASSIGNMENTS_BASE_SELECT}
    ${GET_REVIEW_ASSIGNMENTS_BASE_FROM_JOINS}
    ORDER BY CRA.assigned_at DESC
    LIMIT :limit OFFSET :offset;
  `;

  const rows = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: {
      limit: limitNum,
      offset,
    },
  });

  return {
    page: pageNum,
    limit: limitNum,
    total: rows.length ? Number(rows[0].total) : 0,
    data: rows.map(({ total, ...row }) => row),
  };
}

export async function findReviewAssignmentsBySearchFilters({
  loggedInUserId,
  loggedInUserRoles,
  page = DEFAULT_PAGE_NO,
  limit = DEFAULT_PAGE_LIMIT,
  paginate = true,
  submissionTitle,
  submissionStatuses,
  submissionOwnerUsrIds,
  conferenceId,
  submissionId,
  reviewerUsrIds,
  assignmentStatuses,
  assignedByUsrIds,
  assignedDateFrom,
  assignedDateTo,
  isAdmin = false,
}) {
  const pageNum = Math.max(1, Number(page) || DEFAULT_PAGE_NO);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || DEFAULT_PAGE_LIMIT));
  const offset = (pageNum - 1) * limitNum;
  const paginationSql = paginate ? `LIMIT :limit OFFSET :offset` : ``;

  const roles = Array.isArray(loggedInUserRoles) ? loggedInUserRoles : [];
  const adminMode = isAdmin || roles.includes(USER_ROLE.ADMIN);

  const replacements = {
    ...(paginate ? { limit: limitNum, offset } : {}),
  };

  const where = [];

  if (!adminMode) {
    where.push(`CRA.reviewer_usr_id = :reviewerUserId`);
    where.push(`CRA.status <> :deletedAssignmentStatus`);
    where.push(`CS.current_status <> :deletedSubmissionStatus`);
    replacements.reviewerUserId = Number(loggedInUserId);
    replacements.deletedAssignmentStatus = REVIEW_ASSIGNMENT_STATUS.DELETED;
    replacements.deletedSubmissionStatus = CONTENT_SUBMISSION_STATUS.DELETED;
  }

  if (submissionTitle != null) {
    where.push(`CS.title ILIKE :submissionTitle`);
    replacements.submissionTitle = `%${submissionTitle}%`;
  }

  if (submissionStatuses != null) {
    where.push(`CS.current_status IN (:submissionStatuses)`);
    replacements.submissionStatuses = submissionStatuses;
  }

  if (submissionOwnerUsrIds != null) {
    where.push(`OW.id IN (:submissionOwnerUsrIds)`);
    replacements.submissionOwnerUsrIds = submissionOwnerUsrIds;
  }

  if (conferenceId != null) {
    where.push(`CS.conference_id = :conferenceId`);
    replacements.conferenceId = conferenceId;
  }

  if (submissionId != null) {
    where.push(`CS.id = :submissionId`);
    replacements.submissionId = submissionId;
  }

  if (reviewerUsrIds != null) {
    where.push(`REV.id IN (:reviewerUsrIds)`);
    replacements.reviewerUsrIds = reviewerUsrIds;
  }

  if (assignmentStatuses != null) {
    where.push(`CRA.status IN (:assignmentStatuses)`);
    replacements.assignmentStatuses = assignmentStatuses;
  }

  if (assignedByUsrIds != null) {
    where.push(`CRA.assigned_by_usr_id IN (:assignedByUsrIds)`);
    replacements.assignedByUsrIds = assignedByUsrIds;
  }

  if (assignedDateFrom != null) {
    where.push(`CRA.assigned_at >= :assignedDateFrom::DATE`);
    replacements.assignedDateFrom = assignedDateFrom;
  }

  if (assignedDateTo != null) {
    where.push(`CRA.assigned_at < (:assignedDateTo::DATE + INTERVAL '1 day')`);
    replacements.assignedDateTo = assignedDateTo;
  }

  const sql = `
    ${GET_REVIEW_ASSIGNMENTS_BASE_SELECT}
    ${GET_REVIEW_ASSIGNMENTS_BASE_FROM_JOINS}
    ${where.length ? `WHERE ${where.join("\n      AND ")}` : ``}
    ORDER BY CRA.assigned_at DESC
    ${paginationSql};
  `;

  const rows = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements,
  });

  return {
    page: pageNum,
    limit: limitNum,
    total: rows.length ? Number(rows[0].total) : 0,
    data: rows.map(({ total, ...row }) => row),
  };
}

export async function canCreateReviewAssignment({
  contentSubmissionId,
  reviewerUsrId,
}) {
  const sql = `
    SELECT
      EXISTS (
        SELECT 1
        FROM episteme.content_review_assignment CRA
        WHERE CRA.content_submission_id = :contentSubmissionId
          AND CRA.reviewer_usr_id = :reviewerUsrId
      ) AS "assignmentExists",
      EXISTS (
        SELECT 1
        FROM episteme.content_submission CS
        LEFT JOIN episteme.content_submission_payment CSP
          ON CSP.content_submission_id = CS.id
        WHERE CS.id = :contentSubmissionId
        AND CS.current_status IN (:allowedSubmissionStatus)
        AND CSP.status = :capturedPaymentStatus
        AND CS.owner_usr_id != :reviewerUsrId
      ) AS "submissionExists",
      EXISTS (
        SELECT 1
        FROM episteme."user" U
        WHERE U.id = :reviewerUsrId
          AND U.roles @> ARRAY['REVIEWER']::TEXT[]
      ) AS "reviewerExists";
  `;

  const [row] = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: {
      contentSubmissionId: Number(contentSubmissionId),
      allowedSubmissionStatus: [CONTENT_SUBMISSION_STATUS.PENDING_APPROVAL, CONTENT_SUBMISSION_STATUS.RETURNED],
      capturedPaymentStatus: CONTENT_SUBMISSION_PAYMENT_STATUS.CAPTURED,
      reviewerUsrId: Number(reviewerUsrId),
    },
  });

  return row;
}

export async function canUpdateReviewAssignmentStatus({
  contentSubmissionId,
}) {
  const sql = `
    SELECT
      EXISTS (
        SELECT 1
        FROM episteme.content_submission CS
        LEFT JOIN episteme.content_submission_payment CSP
          ON CSP.content_submission_id = CS.id
        JOIN episteme.conference C
          ON C.id = CS.conference_id
        WHERE CS.id = :contentSubmissionId
        AND CS.current_status IN (:allowedSubmissionStatus)
        AND CSP.status = :capturedPaymentStatus
        AND C.status = :activeConferenceStatus
      ) AS "submissionExists";
  `;

  const [row] = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: {
      contentSubmissionId: Number(contentSubmissionId),
      allowedSubmissionStatus: [CONTENT_SUBMISSION_STATUS.PENDING_APPROVAL, CONTENT_SUBMISSION_STATUS.RETURNED],
      capturedPaymentStatus: CONTENT_SUBMISSION_PAYMENT_STATUS.CAPTURED,
      activeConferenceStatus: CONFERENCE_STATUS.ACTIVE,
    },
  });

  return row;
}

export async function findReviewAssignmentBySubmissionIdAndReviewerUsrId({
  ContentReviewAssignment,
  contentSubmissionId,
  reviewerUsrId
}) {
  return await ContentReviewAssignment.findOne({
    where: {
      contentSubmissionId: Number(contentSubmissionId),
      reviewerUsrId: Number(reviewerUsrId),
    }
  });
}
