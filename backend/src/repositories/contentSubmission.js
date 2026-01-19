import { sequelize } from "../config/db.js";
import { QueryTypes } from "sequelize";
import { CONFERENCE_STATUS, CONTENT_SUBMISSION_STATUS, DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_NO, CONTENT_SUBMISSION_PAYMENT_STATUS, REVIEW_ASSIGNMENT_STATUS, USER_ROLE } from "../utils/constants.js";

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

  const paymentJoin = `LEFT JOIN episteme.content_submission_payment CSP ON CSP.content_submission_id = CS.id`;
  const paymentWhere = isAdmin ? `` : `AND CSP.status = :capturedPaymentStatus`;

  const baseWhere = `
    ${ownershipPredicate}
    AND CS.current_status <> :deletedSubmissionStatus
    AND C.status NOT IN (:excludedConferenceStatus)
    ${paymentWhere}
  `;

  const dataSql = `
    SELECT
      COUNT(*) OVER()    AS "total",
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
      
      CSP.status         AS "paymentStatus",
      
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
    ${paymentJoin}
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
      excludedConferenceStatus: [CONFERENCE_STATUS.INACTIVE, CONFERENCE_STATUS.DELETED],
      capturedPaymentStatus: CONTENT_SUBMISSION_PAYMENT_STATUS.CAPTURED,
      limit: safeLimit,
      offset
    }
  });

  return {
    page: safePage,
    limit: safeLimit,
    total: rows.length ? Number(rows[0].total) : 0,
    data: rows.map(({ total, ...row }) => row),
  };
}

export async function findSubmissionByIdAndUserDetails({
  submissionId,
  loggedInUserId,
  loggedInUserRoles,
}) {
  const roles = Array.isArray(loggedInUserRoles) ? loggedInUserRoles : [];
  const isAdmin = roles.includes(USER_ROLE.ADMIN);
  const isReviewer = roles.includes(USER_ROLE.REVIEWER);

  const replacements = {
    submissionId: submissionId,
    loggedInUserId,
    deletedSubmissionStatus: CONTENT_SUBMISSION_STATUS.DELETED,
    excludedConferenceStatus: [CONFERENCE_STATUS.INACTIVE, CONFERENCE_STATUS.DELETED],
    capturedPaymentStatus: CONTENT_SUBMISSION_PAYMENT_STATUS.CAPTURED,
    excludedAssignmentStatuses: [REVIEW_ASSIGNMENT_STATUS.DECLINED, REVIEW_ASSIGNMENT_STATUS.DELETED],
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
      ${isAdmin ? `, CSP.status AS "paymentStatus"` : ``}
    FROM episteme.content_submission CS
    JOIN episteme.conference C ON C.id = CS.conference_id
    LEFT JOIN episteme.content_submission_payment CSP ON CSP.content_submission_id = CS.id
    WHERE
      CS.id = :submissionId
      AND CS.current_status <> :deletedSubmissionStatus
      AND C.status NOT IN (:excludedConferenceStatus)
  `;

  const whereUser = `
    AND CS.owner_usr_id = :loggedInUserId
    AND CSP.status = :capturedPaymentStatus
  `;
  const whereReviewer = `
    AND (
      CS.owner_usr_id = :loggedInUserId
      OR EXISTS (
        SELECT 1
        FROM episteme.content_review_assignment CRA
        WHERE CRA.content_submission_id = CS.id
          AND CRA.reviewer_usr_id = :loggedInUserId
          AND CRA.status NOT IN (:excludedAssignmentStatuses)
      )
    )
    AND CSP.status = :capturedPaymentStatus`;
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
