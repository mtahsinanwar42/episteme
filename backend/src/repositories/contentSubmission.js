import { sequelize } from "../config/db.js";
import { QueryTypes } from "sequelize";
import { CONFERENCE_STATUS, CONTENT_SUBMISSION_STATUS, DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_NO, USER_ROLE } from "../utils/constants.js";

export async function findSubmissionsByUserDetails({
  loggedInUserId,
  loggedInUserRoles,
  page = DEFAULT_PAGE_NO,
  limit = DEFAULT_PAGE_LIMIT
}) {
  const safePage = Math.max(1, Number(page) || DEFAULT_PAGE_NO);
  const safeLimit = Math.max(1, Number(limit) || DEFAULT_PAGE_LIMIT);
  const offset = (safePage - 1) * safeLimit;

  const isAdmin = Array.isArray(loggedInUserRoles) && loggedInUserRoles.includes(USER_ROLE.ADMIN);
  const ownershipPredicate = isAdmin
    ? `CS.owner_usr_id <> :loggedInUserId`
    : `CS.owner_usr_id = :loggedInUserId`;
  const ownerJoin = isAdmin ? `JOIN episteme.user U ON U.id = CS.owner_usr_id` : ``;

  const baseWhere = `
    ${ownershipPredicate}
    AND CS.current_status <> :deletedSubmissionStatus
    AND C.status <> :deletedConferenceStatus
  `;

  const countSql = `
    SELECT COUNT(*)::BIGINT AS total
    FROM episteme.content_submission CS
    JOIN episteme.conference C ON C.id = CS.conference_id
    ${ownerJoin}
    WHERE ${baseWhere}
  `;

  const [{ total }] = await sequelize.query(countSql, {
    type: QueryTypes.SELECT,
    replacements: {
      loggedInUserId,
      deletedSubmissionStatus: CONTENT_SUBMISSION_STATUS.DELETED,
      deletedConferenceStatus: CONFERENCE_STATUS.DELETED
    }
  });

  const dataSql = `
    SELECT
      CS.id              AS "submissionId",
      CS.title           AS "title",
      CS.topics          AS "topics",
      CS.doi             AS "doi",
      CS.current_status  AS "status",
      CS.created_at      AS "createdAt",
      CS.updated_at      AS "updatedAt",

      C.ID               AS "conferenceId",
      C.title            AS "conferenceTitle",
      C.slug             AS "conferenceSlug",
      C.status           AS "conferenceStatus"
      ${isAdmin ? `,
      U.id               AS "ownerUserId",
      U.email            AS "ownerEmail",
      U.first_name       AS "ownerFirstName",
      U.last_name        AS "ownerLastName",
      U.institution      AS "ownerInstitution",
      U.occupation       AS "ownerOccupation",
      U.country          AS "ownerCountry"`
      : ``
    }
    FROM episteme.content_submission CS
    JOIN episteme.conference C ON (C.id = CS.conference_id)
    ${ownerJoin}
    WHERE ${baseWhere}
    ORDER BY CS.updated_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const rows = await sequelize.query(dataSql, {
    type: QueryTypes.SELECT,
    replacements: {
      loggedInUserId,
      deletedSubmissionStatus: CONTENT_SUBMISSION_STATUS.DELETED,
      deletedConferenceStatus: CONFERENCE_STATUS.DELETED,
      limit: safeLimit,
      offset
    }
  });

  return {
    page: safePage,
    limit: safeLimit,
    total: Number(total || 0),
    data: rows
  };
}

export async function findSubmissionByIdAndUserDetails({
  submissionId,
  loggedInUserId,
  loggedInUserRoles,
}) {
  const isAdmin = loggedInUserRoles.includes(USER_ROLE.ADMIN);
  const isReviewer = loggedInUserRoles.includes(USER_ROLE.REVIEWER);

  const replacements = {
    submissionId: submissionId,
    loggedInUserId,
    deletedSubmissionStatus: CONTENT_SUBMISSION_STATUS.DELETED,
  };

  const baseSelect = `
    SELECT
      CS.id              AS "submissionId",
      CS.title           AS "title",
      CS.topics          AS "topics",
      CS.doi             AS "doi",
      CS.current_status  AS "status",
      CS.created_at      AS "createdAt",
      CS.updated_at      AS "updatedAt",

      C.id               AS "conferenceId",
      C.title            AS "conferenceTitle",
      C.slug             AS "conferenceSlug",
      C.status           AS "conferenceStatus"
    FROM episteme.content_submission CS
    JOIN episteme.conference C ON C.id = CS.conference_id
    WHERE
      CS.id = :submissionId
      AND CS.current_status <> :deletedSubmissionStatus
  `;

  const whereUser = `
    AND CS.owner_usr_id = :loggedInUserId
  `;
  const whereReviewer = `
    AND (
      CS.owner_usr_id = :loggedInUserId
      OR EXISTS (
        SELECT 1
        FROM episteme.content_review_assignment CRA
        WHERE CRA.content_submission_id = CS.id
          AND CRA.reviewer_usr_id = :loggedInUserId
          AND CRA.status <> 9
      )
    )`;
  const whereAdmin = `
    AND CS.owner_usr_id <> :loggedInUserId
  `;

  const sql =
    isAdmin
      ? `${baseSelect} ${whereAdmin};`
      : isReviewer
        ? `${baseSelect} ${whereReviewer};`
        : `${baseSelect} ${whereUser};`;

  const rows = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements,
  });

  return rows[0] ?? null;
}
