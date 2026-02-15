import { sequelize } from "../config/db.js";
import { QueryTypes } from "sequelize";
import { CONFERENCE_STATUS, CONTENT_SUBMISSION_STATUS, DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_NO, REVIEW_ASSIGNMENT_STATUS, STATUS_UPDATE_NOTES } from "../utils/constants.js";


export async function findConferencePublicationsById({
  conferenceId,
  conferenceStatusExcluded = [CONFERENCE_STATUS.INACTIVE, CONFERENCE_STATUS.ACTIVE],
  approvedSubmissionStatus = CONTENT_SUBMISSION_STATUS.APPROVED,
  page = DEFAULT_PAGE_NO,
  limit = DEFAULT_PAGE_LIMIT,
}) {
  const safePage = Math.max(1, Number(page) || DEFAULT_PAGE_NO);
  const safeLimit = Math.max(1, Number(limit) || DEFAULT_PAGE_LIMIT);
  const offset = (safePage - 1) * safeLimit;

  const dataSql = `
    SELECT
      COUNT(*) OVER()                AS "total",
      CS.id                          AS "submissionId",
      CS.title                       AS "title",
      CS.topics                      AS "topics",
      CS.doi                         AS "doi",
      CS.created_at                  AS "createdAt",
      CS.updated_at                  AS "updatedAt",

      U.id                           AS "authorId",
      U.email                        AS "authorEmail",
      U.first_name                   AS "authorFirstName",
      U.last_name                    AS "authorLastName",
      U.institution                  AS "authorInstitution",
      U.occupation                   AS "authorOccupation",
      U.country                      AS "authorCountry",


      F.id                           AS "fileId",
      F.name                         AS "fileName",
      F.storage_key                  AS "storageKey",

      C.id                           AS "conferenceId",
      C.title                        AS "conferenceTitle",
      C.slug                         AS "conferenceSlug",
      C.status                       AS "conferenceStatus"
    FROM episteme.conference C
    JOIN episteme.content_submission CS ON (CS.conference_id = C.id)
    JOIN episteme.content_submission_version CSV ON (CSV.id = CS.current_content_submission_version_id)
    JOIN episteme.user U ON (U.id = CS.owner_usr_id)
    JOIN episteme.file F ON (F.id = CSV.file_id)
    WHERE
      C.id = :conferenceId
      AND C.status NOT IN (:conferenceStatusExcluded)
      AND CS.current_status = :approvedSubmissionStatus
    ORDER BY CS.updated_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const rows = await sequelize.query(dataSql, {
    type: QueryTypes.SELECT,
    replacements: {
      conferenceId,
      conferenceStatusExcluded,
      approvedSubmissionStatus,
      limit: safeLimit,
      offset,
    },
  });

  return {
    page: safePage,
    limit: safeLimit,
    total: rows.length ? Number(rows[0].total) : 0,
    data: rows.map(({ total, ...row }) => row),
  };
}

export async function findConferencesToAutoFinish({
  activeConferenceStatus = CONFERENCE_STATUS.ACTIVE,
}) {
  const sql = `
    SELECT
      C.id AS "id"
    FROM episteme.conference C
    WHERE
      C.status = :activeConferenceStatus
      AND C.end_at + INTERVAL '1 day' <= NOW()
    ORDER BY C.end_at ASC;
  `;

  const rows = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: {
      activeConferenceStatus: Number(activeConferenceStatus),
    },
  });

  return rows.map((row) => Number(row.id));
}

export async function markConferenceAsStatus(
  { conferenceId, status },
  { t }
) {
  const sql = `
    UPDATE episteme.conference
    SET
      status = :status
    WHERE id = :conferenceId
    RETURNING id;
  `;

  await sequelize.query(sql, {
    type: QueryTypes.UPDATE,
    transaction: t,
    replacements: { conferenceId: Number(conferenceId), status: Number(status) },
  });

  return {
    conferenceUpdated: 1,
  };
}

export async function markConferenceAsDeleted(
  { conferenceId, },
  { t }
) {
  const replacements = {
    conferenceId: Number(conferenceId),
    conferenceDeletedStatus: CONFERENCE_STATUS.DELETED,

    submissionDeletedStatus: CONTENT_SUBMISSION_STATUS.DELETED,
    submissionStatusUpdateNotes: STATUS_UPDATE_NOTES.SUBMISSION_DELETION_DUE_TO_CONF_DELETE,

    assignmentDeletedStatus: REVIEW_ASSIGNMENT_STATUS.DELETED,
    assignmentStatusUpdateNotes: STATUS_UPDATE_NOTES.REVIEW_ASSIGNMENT_DELETION_DUE_TO_CONF_DELETE,
  };

  const conferenceUpdateSql = `
    UPDATE episteme.conference
    SET status = :conferenceDeletedStatus
    WHERE id = :conferenceId
    RETURNING id;
  `;
  await sequelize.query(conferenceUpdateSql, {
    type: QueryTypes.UPDATE,
    transaction: t,
    replacements,
  });

  const assocSubmissionsUpdateSql = `
    UPDATE episteme.content_submission cs
    SET current_status = :submissionDeletedStatus,
        status_update_notes = :submissionStatusUpdateNotes
    WHERE cs.conference_id = :conferenceId
      AND cs.current_status <> :submissionDeletedStatus
    RETURNING cs.id;
  `;
  const submissionsUpdateRes = await sequelize.query(assocSubmissionsUpdateSql, {
    type: QueryTypes.UPDATE,
    transaction: t,
    replacements,
  });
  const submissionsUpdateResRows = submissionsUpdateRes?.[0] ?? [];

  const assocReviewAssignmentsUpdateSql = `
    UPDATE episteme.content_review_assignment cra
    SET status = :assignmentDeletedStatus,
        status_update_notes = :assignmentStatusUpdateNotes
    WHERE cra.content_submission_id IN (
      SELECT cs.id FROM episteme.content_submission cs
      WHERE cs.conference_id = :conferenceId
    )
      AND cra.status <> :assignmentDeletedStatus
    RETURNING cra.id;
  `;
  const assignmentsUpdateRes = await sequelize.query(assocReviewAssignmentsUpdateSql, {
    type: QueryTypes.UPDATE,
    transaction: t,
    replacements,
  });
  const assignmentsUpdateResRows = assignmentsUpdateRes?.[0] ?? [];

  return {
    conferenceUpdated: 1,
    submissionsUpdated: submissionsUpdateResRows.length,
    assignmentsUpdated: assignmentsUpdateResRows.length,
  };
}

export async function markConferenceAsFinished(
  { conferenceId, },
  { t }
) {
  const replacements = {
    conferenceId: Number(conferenceId),
    conferenceFinishedStatus: CONFERENCE_STATUS.FINISHED,

    submissionRejectedStatus: CONTENT_SUBMISSION_STATUS.REJECTED,
    submissionStatusUpdateNotes: STATUS_UPDATE_NOTES.SUBMISSION_DELETION_DUE_TO_CONF_FINISH,
    submissionToBeRejectedStatus: [
      CONTENT_SUBMISSION_STATUS.DRAFT,
      CONTENT_SUBMISSION_STATUS.PENDING_APPROVAL,
      CONTENT_SUBMISSION_STATUS.RETURNED,
    ],

    assignmentCancelledStatus: REVIEW_ASSIGNMENT_STATUS.CANCELLED,
    assignmentStatusUpdateNotes: STATUS_UPDATE_NOTES.REVIEW_ASSIGNMENT_DELETION_DUE_TO_CONF_FINISH,
    assignmentToBeCancelledStatus: [
      REVIEW_ASSIGNMENT_STATUS.ASSIGNED,
      REVIEW_ASSIGNMENT_STATUS.ACCEPTED,
      REVIEW_ASSIGNMENT_STATUS.OVERDUE,
    ],
  };

  const confSql = `
    UPDATE episteme.conference
    SET status = :conferenceFinishedStatus
    WHERE id = :conferenceId
    RETURNING id;
  `;
  await sequelize.query(confSql, {
    type: QueryTypes.UPDATE,
    transaction: t,
    replacements,
  });

  const assocSubmissionsUpdateSql = `
    UPDATE episteme.content_submission cs
    SET current_status = :submissionRejectedStatus,
        status_update_notes = :submissionStatusUpdateNotes
    WHERE cs.conference_id = :conferenceId
      AND cs.current_status IN (:submissionToBeRejectedStatus)
    RETURNING cs.id;
  `;
  const submissionsUpdateRes = await sequelize.query(assocSubmissionsUpdateSql, {
    type: QueryTypes.UPDATE,
    transaction: t,
    replacements,
  });
  const submissionsUpdateResRows = submissionsUpdateRes?.[0] ?? [];

  const assocReviewAssignmentsUpdateSql = `
    UPDATE episteme.content_review_assignment cra
    SET status = :assignmentCancelledStatus,
        status_update_notes = :assignmentStatusUpdateNotes
    WHERE cra.content_submission_id IN (
      SELECT cs.id FROM episteme.content_submission cs
      WHERE cs.conference_id = :conferenceId
    )
      AND cra.status IN (:assignmentToBeCancelledStatus)
    RETURNING cra.id;
  `;
  const assignmentsUpdateRes = await sequelize.query(assocReviewAssignmentsUpdateSql, {
    type: QueryTypes.UPDATE,
    transaction: t,
    replacements,
  });
  const assignmentsUpdateResRows = assignmentsUpdateRes?.[0] ?? [];

  return {
    conferenceUpdated: 1,
    submissionsUpdated: submissionsUpdateResRows.length,
    assignmentsUpdated: assignmentsUpdateResRows.length,
  };
}
