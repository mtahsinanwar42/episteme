import ErrorResponse from "../utils/ErrorResponse.js";
import { ANNOUNCEMENT_STATUS } from "../utils/constants.js";
import { serializeAnnouncement } from "../utils/serializers.js";
import { isEmpty, isNotEmpty } from "../utils/string.js";

export function createAnnouncementService({ Announcement, fileService }) {
  if (!Announcement) {
    throw new Error("createAnnouncementService requires { Announcement } model");
  }

  if (!fileService) {
    throw new Error("createAnnouncementService requires { fileService }");
  }

  async function getAnnouncementById(id) {
    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      throw new ErrorResponse(404, "Announcement not found");
    }

    const metadataFilePath = await fileService.getFilePathById(announcement.metadataFileId);
    return serializeAnnouncement(announcement, metadataFilePath);
  }

  async function createAnnouncement(payload) {
    const { title, metadataFilePath, status } = payload;

    if (isEmpty(title) || isEmpty(metadataFilePath)) {
      throw new ErrorResponse(400, "Please provide a title and a metadataFilePath");
    }

    if (!Object.values(ANNOUNCEMENT_STATUS).includes(status)) {
      throw new ErrorResponse(400, "Invalid announcement status");
    }

    const metadataFileId = await fileService.getFileIdByPath(metadataFilePath, { fieldName: "metadataFilePath" });

    const [announcement] = await Announcement.bulkCreate([{
      title,
      metadataFileId,
      status,
    }], { individualHooks: true, returning: true });

    return serializeAnnouncement(announcement, metadataFilePath);
  }

  async function updateAnnouncementById(id, payload) {
    const { title, metadataFilePath, status } = payload;

    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      throw new ErrorResponse(404, "Announcement not found");
    }

    const updates = {};

    if (isNotEmpty(title)) {
      updates.title = title;
    }

    if (Number.isInteger(status)) {
      if (!Object.values(ANNOUNCEMENT_STATUS).includes(status)) {
        throw new ErrorResponse(400, "Invalid announcement status");
      }

      updates.status = status;
    }

    if (isNotEmpty(metadataFilePath)) {
      const metadataFileId = await fileService.getFileIdByPath(metadataFilePath, { fieldName: "metadataFilePath" });
      updates.metadataFileId = metadataFileId;
    }

    await announcement.update(updates);

    return serializeAnnouncement(announcement, metadataFilePath);
  }

  return {
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncementById,
  };
}
