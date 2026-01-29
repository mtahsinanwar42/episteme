import { sequelize } from "../config/db.js";
import { QueryTypes } from "sequelize";
import { CONFERENCE_STATUS, CONTENT_SUBMISSION_STATUS, CONTENT_SUBMISSION_PAYMENT_STATUS, USER_ROLE, REVIEW_ASSIGNMENT_STATUS } from "../utils/constants.js";

export async function findSubmissionMessagesByIdAndUserDetails({
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
    excludedConferenceStatus: [CONFERENCE_STATUS.INACTIVE, CONFERENCE_STATUS.DELETED],
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

  const msgWhereUser = `M.visibility_scope = 'USER_ADMIN'`;
  const msgWhereReviewer = `
    M.visibility_scope = 'ADMIN_REVIEWER'
    AND (
      M.sender_usr_id = :loggedInUserId
      OR M.receiver_usr_id = :loggedInUserId
    )
  `;
  const msgWhereAdmin = `1=1`;

  const accessWhere = isAdmin ? accessWhereAdmin : isReviewer ? accessWhereReviewer : accessWhereUser;
  const msgWhere = isAdmin ? msgWhereAdmin : isReviewer ? msgWhereReviewer : msgWhereUser;

  const sql = `
    SELECT
      M.id            AS "messageId",
      M.created_at    AS "createdAt",
      M.visibility_scope AS "visibilityScope",
      M.message       AS "message",

      jsonb_build_object(
        'id', SU.id,
        'email', SU.email,
        'firstName', SU.first_name,
        'lastName', SU.last_name,
        'userType', M.sender_usr_type
      ) AS "sender",

      CASE WHEN RU.id IS NULL THEN NULL ELSE jsonb_build_object(
        'id', RU.id,
        'email', RU.email,
        'firstName', RU.first_name,
        'lastName', RU.last_name
      ) END AS "receiver"

    FROM episteme.content_submission CS
    JOIN episteme.conference C
      ON C.id = CS.conference_id
    LEFT JOIN episteme.content_submission_payment CSP
      ON CSP.content_submission_id = CS.id
    JOIN episteme.content_submission_message M
      ON M.content_submission_id = CS.id

    JOIN episteme.user SU
      ON SU.id = M.sender_usr_id

    LEFT JOIN episteme.user RU
      ON RU.id = M.receiver_usr_id

    WHERE
      CS.id = :submissionId
      AND CS.current_status <> :deletedSubmissionStatus
      AND C.status NOT IN (:excludedConferenceStatus)
      AND CSP.status = :capturedPaymentStatus
      AND (${accessWhere})
      AND (${msgWhere})

    ORDER BY M.created_at ASC;
  `;

  return sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements,
  });
}

export async function canCreateSubmissionMessage({ submissionId,
  loggedInUserId,
  receiverUsrId = null,
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
      ) AS "isAssignedReviewer",
      EXISTS (
        SELECT 1
        FROM episteme.content_submission CS
        WHERE CS.id = :submissionId
          AND CS.owner_usr_id = :receiverUsrId
      ) AS "adminReceiverIsOwner",
      EXISTS (
        SELECT 1
        FROM episteme.content_review_assignment CRA
        WHERE CRA.content_submission_id = :submissionId
          AND CRA.reviewer_usr_id = :receiverUsrId
          AND CRA.status = :acceptedAssignmentStatus
      ) AS "adminReceiverIsAssignedReviewer"
    ;
  `;

  const [row] = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: {
      submissionId: Number(submissionId),
      loggedInUserId: Number(loggedInUserId),
      receiverUsrId: receiverUsrId === null || receiverUsrId === undefined ? null : Number(receiverUsrId),
      deletedSubmissionStatus: CONTENT_SUBMISSION_STATUS.DELETED,
      allowedSubmissionStatuses: [CONTENT_SUBMISSION_STATUS.PENDING_APPROVAL, CONTENT_SUBMISSION_STATUS.RETURNED,],
      capturedPaymentStatus: CONTENT_SUBMISSION_PAYMENT_STATUS.CAPTURED,
      conferenceStatusExcluded: [CONFERENCE_STATUS.DELETED, CONFERENCE_STATUS.INACTIVE],
      acceptedAssignmentStatus: REVIEW_ASSIGNMENT_STATUS.ACCEPTED,
    },
  });

  return row;
}
