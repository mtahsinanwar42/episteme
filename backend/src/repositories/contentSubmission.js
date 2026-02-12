import { sequelize } from "../config/db.js";
import { QueryTypes } from "sequelize";
import { CONFERENCE_STATUS, CONTENT_SUBMISSION_STATUS, DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_NO, CONTENT_SUBMISSION_PAYMENT_STATUS, REVIEW_ASSIGNMENT_STATUS, USER_ROLE, STATUS_UPDATE_NOTES } from "../utils/constants.js";

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
  const paymentJoin = `JOIN episteme.content_submission_payment CSP ON CSP.content_submission_id = CS.id`;
  const paymentWhere = isAdmin ? `` : `AND CSP.status = :capturedPaymentStatus`;

  const baseWhere = `
    ${ownershipPredicate}
    ${!isAdmin ? `AND CS.current_status <> :deletedSubmissionStatus` : ``}
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

export async function findSubmissionsBySearchFilters({
  loggedInUserId,
  loggedInUserRoles,
  page = DEFAULT_PAGE_NO,
  limit = DEFAULT_PAGE_LIMIT,
  paginate = true,
  title,
  topics,
  doi,
  conferenceId,
  statuses,
  ownerUsrIds,
  createdDateFrom,
  createdDateTo,
  excludeDeleted = false,
}) {
  const safePage = Math.max(1, Number(page) || DEFAULT_PAGE_NO);
  const safeLimit = Math.max(1, Number(limit) || DEFAULT_PAGE_LIMIT);
  const offset = (safePage - 1) * safeLimit;
  const paginationSql = paginate ? `LIMIT :limit OFFSET :offset` : ``;

  const isAdmin = Array.isArray(loggedInUserRoles) && loggedInUserRoles.includes(USER_ROLE.ADMIN);
  const ownerJoin = isAdmin ? `JOIN episteme.user U ON U.id = CS.owner_usr_id` : ``;
  const paymentJoin = `LEFT JOIN episteme.content_submission_payment CSP ON CSP.content_submission_id = CS.id`;

  const replacements = {
    loggedInUserId,
    excludedConferenceStatus: [CONFERENCE_STATUS.INACTIVE, CONFERENCE_STATUS.DELETED],
    ...(paginate ? { limit: safeLimit, offset } : {}),
  };

  const where = [];
  where.push(`C.status NOT IN (:excludedConferenceStatus)`);

  if (!isAdmin) {
    where.push(`CS.owner_usr_id = :loggedInUserId`);
  }

  if (ownerUsrIds != null) {
    where.push(`CS.owner_usr_id IN (:ownerUsrIds)`);
    replacements.ownerUsrIds = ownerUsrIds;
  }

  if (excludeDeleted) {
    where.push(`CS.current_status <> :deletedSubmissionStatus`);
    replacements.deletedSubmissionStatus = CONTENT_SUBMISSION_STATUS.DELETED;
  }

  if (title != null) {
    where.push(`CS.title ILIKE :title`);
    replacements.title = `%${title}%`;
  }

  if (topics != null) {
    where.push(`CS.topics && ARRAY[:topics]::text[]`);
    replacements.topics = topics;
  }

  if (doi != null) {
    where.push(`CS.doi ILIKE :doi`);
    replacements.doi = `%${doi}%`;
  }

  if (conferenceId != null) {
    where.push(`CS.conference_id = :conferenceId`);
    replacements.conferenceId = conferenceId;
  }

  if (statuses != null) {
    where.push(`CS.current_status IN (:statuses)`);
    replacements.statuses = statuses;
  }

  if (createdDateFrom != null) {
    where.push(`CS.created_at >= :createdDateFrom::DATE`);
    replacements.createdDateFrom = createdDateFrom;
  }

  if (createdDateTo != null) {
    where.push(`CS.created_at < (:createdDateTo::DATE + INTERVAL '1 day')`);
    replacements.createdDateTo = createdDateTo;
  }

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
    WHERE ${where.join("\n      AND ")}
    ORDER BY CS.updated_at DESC
    ${paginationSql}
  `;

  const rows = await sequelize.query(dataSql, {
    type: QueryTypes.SELECT,
    replacements,
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
    deletedAssignmentStatus: REVIEW_ASSIGNMENT_STATUS.DELETED,
  };

  const ownerJoin = isAdmin ? `JOIN episteme.user U ON U.id = CS.owner_usr_id` : ``;

  const baseSelect = `
    SELECT
      CS.id              AS "submissionId",
      CS.title           AS "title",
      CS.abstract        AS "abstract",
      CS.topics          AS "topics",
      CS.doi             AS "doi",
      CS.current_status  AS "status",
      CS.status_update_notes AS "statusUpdateNotes",
      CS.current_content_submission_version_id AS "currentContentSubmissionVersionId",
      CS.created_at      AS "createdAt",
      CS.updated_at      AS "updatedAt",
      CS.owner_usr_id    AS "ownerUserId",

      C.id               AS "conferenceId",
      C.title            AS "conferenceTitle",
      C.slug             AS "conferenceSlug",
      C.status           AS "conferenceStatus"
      ${isAdmin ? `,
      CSP.status         AS "paymentStatus",
      U.email            AS "ownerEmail",
      U.first_name       AS "ownerFirstName",
      U.last_name        AS "ownerLastName",
      U.institution      AS "ownerInstitution",
      U.occupation       AS "ownerOccupation",
      U.country          AS "ownerCountry"`
      : ``
    }
    FROM episteme.content_submission CS
    JOIN episteme.conference C ON C.id = CS.conference_id
    LEFT JOIN episteme.content_submission_payment CSP ON CSP.content_submission_id = CS.id
    ${ownerJoin}
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
          AND CRA.status <> :deletedAssignmentStatus
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

export async function markSubmissionAsStatus(
  { submissionId, status, statusUpdateNotes },
  { t }
) {
  const replacements = {
    submissionId: Number(submissionId),
    submissionStatus: Number(status),
    statusUpdateNotes: statusUpdateNotes ?? null,
  };

  const submissionSql = `
    UPDATE episteme.content_submission cs
    SET
      current_status = :submissionStatus,
      status_update_notes = :statusUpdateNotes
    WHERE cs.id = :submissionId
    RETURNING cs.id;
  `;

  await sequelize.query(submissionSql, {
    type: QueryTypes.UPDATE,
    transaction: t,
    replacements,
  });

  return {
    submissionUpdated: 1,
  };
}

export async function markSubmissionAsApprovedOrRejected(
  { submissionId, status, statusUpdateNotes },
  { t }
) {
  const replacements = {
    submissionId: Number(submissionId),
    submissionStatus: Number(status),
    submissionStatusUpdateNotes: statusUpdateNotes ?? null,

    assignmentCancelledStatus: REVIEW_ASSIGNMENT_STATUS.CANCELLED,
    assignmentStatusUpdateNotes: STATUS_UPDATE_NOTES.REVIEW_ASSIGNMENT_CANCELLATION_DUE_TO_SUBMISSION_ACCEPT_REJECT,
    assignmentToBeCancelledStatus: [
      REVIEW_ASSIGNMENT_STATUS.ASSIGNED,
      REVIEW_ASSIGNMENT_STATUS.ACCEPTED,
    ],
  };

  const submissionSql = `
    UPDATE episteme.content_submission cs
    SET
      current_status = :submissionStatus,
      status_update_notes = :submissionStatusUpdateNotes
    WHERE cs.id = :submissionId
    RETURNING cs.id;
  `;
  await sequelize.query(submissionSql, {
    type: QueryTypes.UPDATE,
    transaction: t,
    replacements,
  });

  const assocAssignmentsSql = `
    UPDATE episteme.content_review_assignment cra
    SET
      status = :assignmentCancelledStatus,
      status_update_notes = :assignmentStatusUpdateNotes
    WHERE cra.content_submission_id = :submissionId
      AND cra.status IN (:assignmentToBeCancelledStatus)
    RETURNING cra.id;
  `;

  const assignmentsUpdateRes = await sequelize.query(assocAssignmentsSql, {
    type: QueryTypes.UPDATE,
    transaction: t,
    replacements,
  });
  const assignmentsUpdateResRows = assignmentsUpdateRes?.[0] ?? [];

  return {
    submissionUpdated: 1,
    assignmentsUpdated: assignmentsUpdateResRows.length,
  };
}

export async function markSubmissionAsDeleted({ submissionId, statusUpdateNotes, }, { t }) {
  const replacements = {
    submissionId: Number(submissionId),
    submissionDeletedStatus: CONTENT_SUBMISSION_STATUS.DELETED,
    submissionStatusUpdateNotes: statusUpdateNotes ?? null,

    assignmentDeletedStatus: REVIEW_ASSIGNMENT_STATUS.DELETED,
    assignmentStatusUpdateNotes: STATUS_UPDATE_NOTES.REVIEW_ASSIGNMENT_DELETION_DUE_TO_SUBMISSION_DELETE,
  };

  const submissionSql = `
    UPDATE episteme.content_submission cs
    SET
      current_status = :submissionDeletedStatus,
      status_update_notes = :submissionStatusUpdateNotes
    WHERE cs.id = :submissionId
      AND cs.current_status <> :submissionDeletedStatus
    RETURNING cs.id;
  `;

  await sequelize.query(submissionSql, {
    type: QueryTypes.UPDATE,
    transaction: t,
    replacements,
  });

  const assocAssignmentsSql = `
    UPDATE episteme.content_review_assignment cra
    SET
      status = :assignmentDeletedStatus,
      status_update_notes = :assignmentStatusUpdateNotes
    WHERE cra.content_submission_id = :submissionId
      AND cra.status <> :assignmentDeletedStatus
    RETURNING cra.id;
  `;

  const assignmentsUpdateRes = await sequelize.query(assocAssignmentsSql, {
    type: QueryTypes.UPDATE,
    transaction: t,
    replacements,
  });
  const assignmentsUpdateResRows = assignmentsUpdateRes?.[0] ?? [];

  return {
    submissionUpdated: 1,
    assignmentsUpdated: assignmentsUpdateResRows.length,
  };
}
