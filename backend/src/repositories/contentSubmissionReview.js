import { sequelize } from "../config/db.js";
import { QueryTypes } from "sequelize";
import { CONTENT_SUBMISSION_STATUS, DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_NO, REVIEW_ASSIGNMENT_STATUS, USER_ROLE } from "../utils/constants.js";

export async function findSubmissionReviewsByIdAndUserDetails({
  submissionId,
  loggedInUserId,
  loggedInUserRoles,
}) {
  const roles = Array.isArray(loggedInUserRoles) ? loggedInUserRoles : [];
  const isAdmin = roles.includes(USER_ROLE.ADMIN);

  const replacements = {
    submissionId: Number(submissionId),
    loggedInUserId: Number(loggedInUserId),
    deletedSubmissionStatus: CONTENT_SUBMISSION_STATUS.DELETED,
    excludedAssignmentStatuses: [REVIEW_ASSIGNMENT_STATUS.DECLINED, REVIEW_ASSIGNMENT_STATUS.DELETED],
  };

  const selectAndJoins = `
    SELECT
      CR.id                           AS "reviewId",
      CR.created_at                   AS "createdAt",
      CR.comment                      AS "comment",
      CR.recommendation               AS "recommendation",
      CR.content_review_assignment_id AS "contentReviewAssignmentId",

      jsonb_build_object(
        'id', RU.id,
        'email', RU.email,
        'firstName', RU.first_name,
        'lastName', RU.last_name
      ) AS "reviewer",

      jsonb_build_object(
        'versionId', V.id,
        'versionNo', V.version_no,
        'createdAt', V.created_at,
        'changeLog', V.change_log,
        'file', CASE WHEN F.id IS NULL THEN NULL ELSE jsonb_build_object(
          'id', F.id,
          'name', F.name,
          'storageKey', F.storage_key
        ) END
      ) AS "version",

      CASE WHEN RV.id IS NULL THEN NULL ELSE jsonb_build_object(
        'versionId', RV.id,
        'versionNo', RV.version_no,
        'createdAt', RV.created_at,
        'changeLog', RV.change_log,
        'file', CASE WHEN RF.id IS NULL THEN NULL ELSE jsonb_build_object(
          'id', RF.id,
          'name', RF.name,
          'storageKey', RF.storage_key
        ) END
      ) END AS "reviewerVersion"

    FROM episteme.content_submission CS
    JOIN episteme.content_review_assignment CRA
      ON CRA.content_submission_id = CS.id
    JOIN episteme.content_review CR
      ON CR.content_review_assignment_id = CRA.id
    JOIN episteme.user RU
      ON RU.id = CRA.reviewer_usr_id
    JOIN episteme.content_submission_version V
      ON V.id = CR.content_submission_version_id
    LEFT JOIN episteme.content_submission_version RV
      ON RV.id = CR.reviewer_content_submission_version_id
    LEFT JOIN episteme.file F
      ON F.id = V.file_id
    LEFT JOIN episteme.file RF
      ON RF.id = RV.file_id
  `;

  const baseWhere = `
    WHERE
      CS.id = :submissionId
      AND CS.current_status <> :deletedSubmissionStatus
      AND CRA.status NOT IN (:excludedAssignmentStatuses)
  `;

  const reviewWhereReviewer = `AND CRA.reviewer_usr_id = :loggedInUserId`;
  const reviewWhereAdmin = `AND CS.owner_usr_id <> :loggedInUserId`;

  const roleWhere = isAdmin ? reviewWhereAdmin : reviewWhereReviewer;

  const sql = `
    ${selectAndJoins}
    ${baseWhere}
    ${roleWhere}
    ORDER BY CR.created_at ASC;
  `;

  return sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements,
  });
}

export async function findSubmissionReviewersById({
  submissionId,
  page,
  limit,
}) {
  const pageNum = Math.max(1, Number(page) || DEFAULT_PAGE_NO);
  const limitNum = Math.max(1, Math.max(1, Number(limit) || DEFAULT_PAGE_LIMIT));
  const offset = (pageNum - 1) * limitNum;

  const sql = `
    SELECT
      COUNT(*) OVER()     AS "total",
      U.id                AS "id",
      U.email             AS "email",
      U.first_name        AS "firstName",
      U.last_name         AS "lastName",
      U.phone_number      AS "phone",
      U.roles             AS "roles",
      U.status            AS "status",
      U.institution       AS "institution",
      U.occupation        AS "occupation",
      U.country           AS "country",
      CRA.id              AS "assignmentId",
      CRA.status          AS "assignmentStatus",
      CRA.assigned_at     AS "assignedAt",
      CRA.assigned_by_usr_id AS "assignedByUserId",
      CRA.assigned_by_notes  AS "assignedByNotes"
    FROM episteme.content_review_assignment CRA
    JOIN episteme.user U
      ON U.id = CRA.reviewer_usr_id
    WHERE
      CRA.content_submission_id = :submissionId
      AND CRA.status NOT IN (:excludedAssignmentStatuses)
    ORDER BY CRA.assigned_at DESC, U.last_name ASC, U.first_name ASC
    LIMIT :limit OFFSET :offset;
  `;

  const rows = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: {
      submissionId: Number(submissionId),
      excludedAssignmentStatuses: [REVIEW_ASSIGNMENT_STATUS.DECLINED, REVIEW_ASSIGNMENT_STATUS.DELETED],
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
