import { sequelize } from "../config/db.js";
import { QueryTypes } from "sequelize";
import { CONFERENCE_STATUS, CONTENT_SUBMISSION_STATUS, CONTENT_SUBMISSION_PAYMENT_STATUS, USER_ROLE, REVIEW_ASSIGNMENT_STATUS } from "../utils/constants.js";

export async function findSubmissionVersionsByIdAndUserDetails({
  submissionId,
  loggedInUserId,
  loggedInUserRoles,
}) {
  const roles = Array.isArray(loggedInUserRoles) ? loggedInUserRoles : [];
  const isAdmin = roles.includes(USER_ROLE.ADMIN);
  const isReviewer = roles.includes(USER_ROLE.REVIEWER);

  const replacements = {
    submissionId: Number(submissionId),
    loggedInUserId: Number(loggedInUserId),
    deletedSubmissionStatus: CONTENT_SUBMISSION_STATUS.DELETED,
    deletedConferenceStatus: CONFERENCE_STATUS.DELETED,
    capturedPaymentStatus: CONTENT_SUBMISSION_PAYMENT_STATUS.CAPTURED,
    deletedAssignmentStatus: REVIEW_ASSIGNMENT_STATUS.DELETED,
  };

  const accessWhereUser = `CS.owner_usr_id = :loggedInUserId`;
  const accessWhereReviewer = `
    (
      CS.owner_usr_id = :loggedInUserId
      OR EXISTS (
        SELECT 1
        FROM episteme.content_review_assignment CRA
        WHERE CRA.content_submission_id = CS.id
          AND CRA.reviewer_usr_id = :loggedInUserId
          AND CRA.status <> :deletedAssignmentStatus
      )
    )
  `;
  const accessWhereAdmin = `CS.owner_usr_id <> :loggedInUserId`;

  const versionWhereUser = `V.uploader_usr_type IN ('USER', 'ADMIN')`;
  const versionWhereReviewer = `V.uploader_usr_type = 'USER'`;
  const versionWhereAdmin = `V.uploader_usr_type IN ('USER', 'ADMIN')`;

  const accessWhere = isAdmin
    ? accessWhereAdmin
    : isReviewer
      ? accessWhereReviewer
      : accessWhereUser;
  const versionWhere = isAdmin
    ? versionWhereAdmin
    : isReviewer
      ? versionWhereReviewer
      : versionWhereUser;

  const sql = `
    SELECT
      V.id            AS "versionId",
      V.version_no    AS "versionNo",
      V.created_at    AS "createdAt",
      V.change_log    AS "changeLog",

      jsonb_build_object(
        'id', UU.id,
        'email', UU.email,
        'firstName', UU.first_name,
        'lastName', UU.last_name,
        'userType', V.uploader_usr_type
      ) AS "uploader",

      CASE WHEN F.id IS NULL THEN NULL ELSE jsonb_build_object(
        'id', F.id,
        'name', F.name,
        'storageKey', F.storage_key
      ) END AS "file"

    FROM episteme.content_submission CS
    JOIN episteme.content_submission_version V
      ON V.content_submission_id = CS.id
    JOIN episteme.conference C
      ON C.id = CS.conference_id
    LEFT JOIN episteme.content_submission_payment CSP
      ON CSP.content_submission_id = CS.id
    LEFT JOIN episteme.user UU
      ON UU.id = V.uploader_usr_id

    LEFT JOIN episteme.file F
      ON F.id = V.file_id

    WHERE
      CS.id = :submissionId
      AND CS.current_status <> :deletedSubmissionStatus
      AND C.status <> :deletedConferenceStatus
      AND CSP.status = :capturedPaymentStatus
      AND (${accessWhere})
      AND (${versionWhere})

    ORDER BY V.version_no ASC;
  `;

  return sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements,
  });
}

export async function canCreateSubmissionVersion({
  submissionId,
  loggedInUserId,
}) {
  const sql = `
  SELECT
    EXISTS (
      SELECT 1
      FROM episteme.content_submission CS
      JOIN episteme.content_submission_payment CSP
        ON CSP.content_submission_id = CS.id
      JOIN episteme.conference C
        ON C.id = CS.conference_id
      WHERE CS.id = :submissionId
        AND CS.current_status <> :deletedSubmissionStatus
        AND CSP.status = :capturedPaymentStatus
        AND C.status NOT IN (:conferenceStatusExcluded)
        AND CS.current_status IN (:allowedSubmissionStatuses)
    ) AS "submissionExists",
    EXISTS (
      SELECT 1
      FROM episteme.content_submission CS
      WHERE CS.id = :submissionId
        AND CS.owner_usr_id = :loggedInUserId
    ) AS "isOwner",
    EXISTS (
      SELECT 1
      FROM episteme.content_review_assignment CRA
      WHERE CRA.content_submission_id = :submissionId
        AND CRA.reviewer_usr_id = :loggedInUserId
        AND CRA.status = :acceptedAssignmentStatus
    ) AS "isAssignedReviewer"
  ;
`;

  const [row] = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: {
      submissionId: Number(submissionId),
      loggedInUserId: Number(loggedInUserId),
      deletedSubmissionStatus: CONTENT_SUBMISSION_STATUS.DELETED,
      allowedSubmissionStatuses: [CONTENT_SUBMISSION_STATUS.PENDING_APPROVAL, CONTENT_SUBMISSION_STATUS.RETURNED,],
      capturedPaymentStatus: CONTENT_SUBMISSION_PAYMENT_STATUS.CAPTURED,
      conferenceStatusExcluded: [CONFERENCE_STATUS.DELETED, CONFERENCE_STATUS.INACTIVE],
      acceptedAssignmentStatus: REVIEW_ASSIGNMENT_STATUS.ACCEPTED,
    },
  });

  return row;
}

export async function findSubmissionVersionByIdAndUploaderUsrType({
  ContentSubmissionVersion,
  id,
  uploaderUsrType,
}) {
  return await ContentSubmissionVersion.findOne({
    where: {
      id,
      uploaderUsrType,
    }
  });
}
