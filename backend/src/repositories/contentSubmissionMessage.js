import { sequelize } from "../config/db.js";
import { QueryTypes } from "sequelize";
import { CONTENT_SUBMISSION_STATUS, USER_ROLE } from "../utils/constants.js";

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
          AND CRA.status NOT IN (3, 9)
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
    JOIN episteme.content_submission_message M
      ON M.content_submission_id = CS.id

    JOIN episteme.user SU
      ON SU.id = M.sender_usr_id

    LEFT JOIN episteme.user RU
      ON RU.id = M.receiver_usr_id

    WHERE
      CS.id = :submissionId
      AND CS.current_status <> :deletedSubmissionStatus
      AND (${accessWhere})
      AND (${msgWhere})

    ORDER BY M.created_at ASC;
  `;

  return sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements,
  });
}
