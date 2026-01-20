import { sequelize } from "../config/db.js";
import { QueryTypes } from "sequelize";
import { CONFERENCE_STATUS, CONTENT_SUBMISSION_STATUS, DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_NO } from "../utils/constants.js";


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
