import ErrorResponse from "../utils/ErrorResponse.js";
import { ACTIVITY_STATUS } from "../utils/constants.js";
import { serializeActivity } from "../utils/serializers.js";
import { isEmpty, isNotEmpty } from "../utils/string.js";

export function createActivityService({ Activity, fileService }) {
  if (!Activity) {
    throw new Error("createActivityService requires { Activity } model");
  }

  if (!fileService) {
    throw new Error("createActivityService requires { fileService }");
  }

  async function getActivityById(id) {
    const activity = await Activity.findByPk(id);
    if (!activity) {
      throw new ErrorResponse(404, "Activity not found");
    }

    const metadataFilePath = await fileService.getFilePathById(activity.metadataFileId);
    return serializeActivity(activity, metadataFilePath);
  }

  async function createActivity(payload) {
    const { title, metadataFilePath, status } = payload;

    if (isEmpty(title) || isEmpty(metadataFilePath)) {
      throw new ErrorResponse(400, "Please provide a title and a metadataFilePath");
    }

    if (!Object.values(ACTIVITY_STATUS).includes(status)) {
      throw new ErrorResponse(400, "Invalid activity status");
    }

    const metadataFileId = await fileService.getFileIdByPath(metadataFilePath, { fieldName: "metadataFilePath" });

    const [activity] = await Activity.bulkCreate([{
      title,
      metadataFileId,
      status,
    }], { individualHooks: true, returning: true });

    return serializeActivity(activity, metadataFilePath);
  }

  async function updateActivityById(id, payload) {
    const { title, metadataFilePath, status } = payload;

    const activity = await Activity.findByPk(id);
    if (!activity) {
      throw new ErrorResponse(404, "Activity not found");
    }

    const updates = {};

    if (isNotEmpty(title)) {
      updates.title = title;
    }

    if (Number.isInteger(status)) {
      if (!Object.values(ACTIVITY_STATUS).includes(status)) {
        throw new ErrorResponse(400, "Invalid activity status");
      }

      updates.status = status;
    }

    if (isNotEmpty(metadataFilePath)) {
      const metadataFileId = await fileService.getFileIdByPath(metadataFilePath, { fieldName: "metadataFilePath" });
      updates.metadataFileId = metadataFileId;
    }

    await activity.update(updates);

    return serializeActivity(activity, metadataFilePath);
  }

  return {
    getActivityById,
    createActivity,
    updateActivityById,
  };
}
