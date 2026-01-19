import { QueryTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { REVIEW_ASSIGNMENT_STATUS, DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_NO, CONTENT_SUBMISSION_STATUS, CONTENT_SUBMISSION_PAYMENT_STATUS } from "../utils/constants.js";

const GET_REVIEW_ASSIGNMENTS_BASE_SELECT = `
  SELECT
    COUNT(*) OVER()           AS "total",
    CRA.id                    AS "assignmentId",
    CRA.content_submission_id AS "submissionId",
    CRA.reviewer_usr_id       AS "reviewerUserId",
    CRA.status                AS "assignmentStatus",
    CRA.assigned_at           AS "assignedAt",
    CRA.assigned_by_usr_id    AS "assignedByUserId",
    CRA.assigned_by_notes     AS "assignedByNotes",

    CS.title                  AS "submissionTitle",
    CS.conference_id          AS "conferenceId",
    CS.current_status         AS "submissionStatus",
    CS.created_at             AS "submissionCreatedAt",
    CS.updated_at             AS "submissionUpdatedAt",

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
      AND CRA.status NOT IN (:excludedStatuses)
    ORDER BY CRA.assigned_at DESC
    LIMIT :limit OFFSET :offset;
  `;

  const rows = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: {
      reviewerUserId: Number(userId),
      excludedStatuses: [REVIEW_ASSIGNMENT_STATUS.DECLINED, REVIEW_ASSIGNMENT_STATUS.DELETED],
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
        AND CS.current_status <> :deletedSubmissionStatus
        AND CSP.status = :capturedPaymentStatus
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
      deletedSubmissionStatus: CONTENT_SUBMISSION_STATUS.DELETED,
      capturedPaymentStatus: CONTENT_SUBMISSION_PAYMENT_STATUS.CAPTURED,
      reviewerUsrId: Number(reviewerUsrId),
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
