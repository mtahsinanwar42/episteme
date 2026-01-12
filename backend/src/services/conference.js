import { Op } from "sequelize";
import ErrorResponse from "../utils/ErrorResponse.js";
import { CONFERENCE_STATUS } from "../utils/constants.js";
import { serializeConference } from "../utils/serializers.js";
import { isEmpty, isNotEmpty } from "../utils/string.js";

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

  async function createConference(payload) {
    const { title, slug, startAt, endAt, submissionPeriodStartAt, submissionPeriodEndAt, metadataFilePath, } =
      payload;

    if (isEmpty(title) || isEmpty(slug)
      || isEmpty(startAt) || isEmpty(endAt)
      || isEmpty(submissionPeriodStartAt) || isEmpty(submissionPeriodEndAt)) {

      throw new ErrorResponse(400, "Please provide a title, slug, startAt, endAt, submissionPeriodStartAt and submissionPeriodEndAt");
    }

    if (await Conference.findOne({ where: { slug } })) {
      throw new ErrorResponse(400, "Slug already in use");
    }

    let metadataFileId = null;

    if (isNotEmpty(metadataFilePath)) {
      metadataFileId = await fileService.getFileIdByPath(metadataFilePath, { fieldName: "metadataFilePath" });
    }

    const [conference] = await Conference.bulkCreate([{
      title,
      slug,
      startAt,
      endAt,
      submissionPeriodStartAt,
      submissionPeriodEndAt,
      metadataFileId,
    }], { individualHooks: true, returning: true });

    return serializeConference(conference, metadataFilePath);
  }

  async function updateConferenceById(id, payload) {
    const { title, slug, startAt, endAt, submissionPeriodStartAt, submissionPeriodEndAt, metadataFilePath, } =
      payload;

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

    await conference.update(updates);

    return serializeConference(conference, metadataFilePath);
  }

  async function updateConferenceStatusById(id, status) {
    if (!Object.values(CONFERENCE_STATUS).includes(status)) {
      throw new ErrorResponse(400, "Invalid conference status");
    }

    const conference = await Conference.findByPk(id);
    if (!conference) {
      throw new ErrorResponse(404, "Conference not found");
    }

    await conference.update({ status });

    return serializeConference(conference);
  }

  return {
    getConferenceById,
    createConference,
    updateConferenceById,
    updateConferenceStatusById,
  };
}
