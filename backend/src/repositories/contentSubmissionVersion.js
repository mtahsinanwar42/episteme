import { sequelize } from "../config/db.js";
import { QueryTypes } from "sequelize";
import { CONTENT_SUBMISSION_STATUS, USER_ROLE } from "../utils/constants.js";

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
          AND CRA.status <> 9
      )
    )
  `;
  const accessWhereAdmin = `CS.owner_usr_id <> :loggedInUserId`;

  const versionWhereUser = `V.uploader_usr_type IN ('USER', 'ADMIN')`;
  const versionWhereReviewer = `V.uploader_usr_type = 'USER'`;
  // TODO: if I want to show the reviewer uploaded versions in the Versions tab
  //   const versionWhereReviewer = `
  //   (
  //     V.uploader_usr_type = 'USER'
  //     OR (V.uploader_usr_type = 'REVIEWER' AND V.uploader_usr_id = :loggedInUserId)
  //   )
  // `;
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

    LEFT JOIN episteme.user UU
      ON UU.id = V.uploader_usr_id

    LEFT JOIN episteme.file F
      ON F.id = V.file_id

    WHERE
      CS.id = :submissionId
      AND CS.current_status <> :deletedSubmissionStatus
      AND (${accessWhere})
      AND (${versionWhere})

    ORDER BY V.version_no ASC;
  `;

  return sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements,
  });
}
