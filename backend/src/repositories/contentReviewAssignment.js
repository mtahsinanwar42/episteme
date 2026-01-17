import { QueryTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { REVIEW_ASSIGNMENT_STATUS } from "../utils/constants.js";

const GET_REVIEW_ASSIGNMENTS_BASE_SELECT = `
  SELECT
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

export async function findReviewAssignmentsByUserId(userId) {
  const sql = `
    ${GET_REVIEW_ASSIGNMENTS_BASE_SELECT}
    ${GET_REVIEW_ASSIGNMENTS_BASE_FROM_JOINS}
    WHERE
      CRA.reviewer_usr_id = :reviewerUserId
      AND CRA.status NOT IN (:excludedStatuses)
    ORDER BY CRA.assigned_at DESC;
  `;

  return sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: {
      reviewerUserId: Number(userId),
      excludedStatuses: [REVIEW_ASSIGNMENT_STATUS.DECLINED, REVIEW_ASSIGNMENT_STATUS.DELETED],
    },
  });
}

export async function findReviewAssignments() {
  const sql = `
    ${GET_REVIEW_ASSIGNMENTS_BASE_SELECT}
    ${GET_REVIEW_ASSIGNMENTS_BASE_FROM_JOINS}
    ORDER BY CRA.assigned_at DESC;
  `;

  return sequelize.query(sql, {
    type: QueryTypes.SELECT,
  });
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
        WHERE CS.id = :contentSubmissionId
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
      reviewerUsrId: Number(reviewerUsrId),
    },
  });

  return row;
}
