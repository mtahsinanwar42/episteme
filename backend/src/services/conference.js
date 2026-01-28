import { Op } from "sequelize";
import { findConferencePublicationsById, markConferenceAsStatus, markConferenceAsDeleted, markConferenceAsFinished } from "../repositories/conference.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { CONFERENCE_STATUS, CONTENT_SUBMISSION_STATUS } from "../utils/constants.js";
import { serializeConference } from "../utils/serializers.js";
import { isEmpty, isNotEmpty } from "../utils/string.js";
import { sequelize } from "../config/db.js";

export function createConferenceService({ Conference, fileService }) {
  if (!Conference) {
    throw new Error("createConferenceService requires { Conference } model");
  }

  if (!fileService) {
    throw new Error("createConferenceService requires { fileService }");
  }

  async function getConferenceById(id) {
    const conference = await Conference.findByPk(id);

    if (!conference) {
      throw new ErrorResponse(404, "Conference not found");
    }

    const metadataFilePath = await fileService.getFilePathById(conference.metadataFileId);
    return serializeConference(conference, metadataFilePath);
  }

  async function getConferencePublicationsById(conferenceId, { page, limit }) {
    if (!conferenceId || Number.isNaN(Number(conferenceId))) {
      throw new ErrorResponse(400, "Invalid conference ID");
    }

    const excludedConferenceStatuses = [
      CONFERENCE_STATUS.INACTIVE,
      CONFERENCE_STATUS.ACTIVE,
      CONFERENCE_STATUS.DELETED,
    ];

    return findConferencePublicationsById({
      conferenceId: Number(conferenceId),
      conferenceStatusExcluded: excludedConferenceStatuses,
      approvedSubmissionStatus: CONTENT_SUBMISSION_STATUS.APPROVED,
      page,
      limit,
    });
  }

  async function createConference(payload) {
    const { title, slug, startAt, endAt, submissionPeriodStartAt, submissionPeriodEndAt, metadataFilePath, status } =
      payload;

    if (isEmpty(title) || isEmpty(slug)
      || isEmpty(startAt) || isEmpty(endAt)
      || isEmpty(submissionPeriodStartAt) || isEmpty(submissionPeriodEndAt)
      || isEmpty(metadataFilePath)) {

      throw new ErrorResponse(400, "Please provide a title, slug, startAt, endAt, submissionPeriodStartAt, submissionPeriodEndAt and metadataFilePath");
    }

    if (!Object.values(CONFERENCE_STATUS).includes(status)) {
      throw new ErrorResponse(400, "Invalid conference status");
    }

    if (await Conference.findOne({ where: { slug } })) {
      throw new ErrorResponse(400, "Slug already in use");
    }

    const metadataFileId = await fileService.getFileIdByPath(metadataFilePath, { fieldName: "metadataFilePath" });

    const [conference] = await Conference.bulkCreate([{
      title,
      slug,
      startAt,
      endAt,
      submissionPeriodStartAt,
      submissionPeriodEndAt,
      metadataFileId,
      status,
    }], { individualHooks: true, returning: true });

    return serializeConference(conference, metadataFilePath);
  }

  async function updateConferenceById(id, payload) {
    const { title, slug, startAt, endAt, submissionPeriodStartAt,
      submissionPeriodEndAt, metadataFilePath, status } = payload;

    const conference = await Conference.findByPk(id);
    if (!conference) {
      throw new ErrorResponse(404, "Conference not found");
    }

    const updates = {};

    if (isNotEmpty(title)) {
      updates.title = title;
    }

    if (isNotEmpty(slug)) {
      const newSlug = slug.trim();

      if (newSlug !== conference.slug) {
        const exists = await Conference.findOne({
          where: { slug: newSlug, id: { [Op.ne]: id } },
          attributes: ["id"],
        });

        if (exists) {
          throw new ErrorResponse(400, "Slug already in use");
        }
      }

      updates.slug = newSlug;
    }


    if (isNotEmpty(startAt)) {
      updates.startAt = startAt;
    }

    if (isNotEmpty(endAt)) {
      updates.endAt = endAt;
    }

    if (isNotEmpty(submissionPeriodStartAt)) {
      updates.submissionPeriodStartAt = submissionPeriodStartAt;
    }

    if (isNotEmpty(submissionPeriodEndAt)) {
      updates.submissionPeriodEndAt = submissionPeriodEndAt;
    }

    if (isNotEmpty(metadataFilePath)) {
      updates.metadataFileId = await fileService.getFileIdByPath(metadataFilePath, { fieldName: "metadataFilePath" });
    }

    if (Number.isInteger(status)) {
      if (!Object.values(CONFERENCE_STATUS).includes(status)) {
        throw new ErrorResponse(400, "Invalid conference status");
      }
    }

    return sequelize.transaction(async (t) => {
      if (Object.keys(updates).length > 0) {
        await conference.update(updates, { transaction: t });
      }

      if (Number.isInteger(status)) {
        if (status === CONFERENCE_STATUS.DELETED) {
          await markConferenceAsDeleted({ conferenceId: id }, { t });
        } else if (status === CONFERENCE_STATUS.FINISHED) {
          await markConferenceAsFinished({ conferenceId: id }, { t });
        } else {
          await markConferenceAsStatus({ conferenceId: id, status }, { t });
        }

        conference.set("status", status);
      }

      return serializeConference(conference, metadataFilePath);
    });
  }

  async function updateConferenceStatusById(id, status) {
    if (!Object.values(CONFERENCE_STATUS).includes(status)) {
      throw new ErrorResponse(400, "Invalid conference status");
    }

    const conference = await Conference.findByPk(id);
    if (!conference) {
      throw new ErrorResponse(404, "Conference not found");
    }

    await sequelize.transaction(async (t) => {
      if (status === CONFERENCE_STATUS.DELETED) {
        await markConferenceAsDeleted({ conferenceId: id }, { t });
      } else if (status === CONFERENCE_STATUS.FINISHED) {
        await markConferenceAsFinished({ conferenceId: id }, { t });
      } else {
        await markConferenceAsStatus({ conferenceId: id, status }, { t });
      }
    });

    conference.set("status", status);

    return serializeConference(conference);
  }

  return {
    getConferenceById,
    getConferencePublicationsById,
    createConference,
    updateConferenceById,
    updateConferenceStatusById,
  };
}
