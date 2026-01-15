import { sequelize } from "../config/db.js";
import { QueryTypes } from "sequelize";
import { CONTENT_SUBMISSION_STATUS, USER_ROLE } from "../utils/constants.js";

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
  };

  const sqlReviewer = `
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

    WHERE
      CS.id = :submissionId
      AND CS.current_status <> :deletedSubmissionStatus
      AND CRA.reviewer_usr_id = :loggedInUserId

    ORDER BY CR.created_at ASC;
  `;

  const sqlAdmin = `
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

    WHERE
      CS.id = :submissionId
      AND CS.current_status <> :deletedSubmissionStatus
      AND CS.owner_usr_id <> :loggedInUserId

    ORDER BY CR.created_at ASC;
  `;

  const sql = isAdmin ? sqlAdmin : sqlReviewer;

  return sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements,
  });
}
