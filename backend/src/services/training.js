import ErrorResponse from "../utils/ErrorResponse.js";
import { TRAINING_STATUS } from "../utils/constants.js";
import { serializeTraining } from "../utils/serializers.js";
import { isEmpty, isNotEmpty } from "../utils/string.js";

export function createTrainingService({ Training, fileService }) {
  if (!Training) {
    throw new Error("createTrainingService requires { Training } model");
  }

  if (!fileService) {
    throw new Error("createTrainingService requires { fileService }");
  }

  async function getTrainingById(id) {
    const training = await Training.findByPk(id);

    if (!training) {
      throw new ErrorResponse(404, "Training not found");
    }

    const metadataFilePath = await fileService.getFilePathById(training.metadataFileId);
    return serializeTraining(training, metadataFilePath);
  }

  async function createTraining(payload) {
    const { title, metadataFilePath, status } = payload;

    if (isEmpty(title) || isEmpty(metadataFilePath)) {
      throw new ErrorResponse(400, "Please provide a title and a metadataFilePath");
    }

    if (!Object.values(TRAINING_STATUS).includes(status)) {
      throw new ErrorResponse(400, "Invalid training status");
    }

    const metadataFileId = await fileService.getFileIdByPath(metadataFilePath, { fieldName: "metadataFilePath" });

    const [training] = await Training.bulkCreate([{
      title,
      metadataFileId,
      status,
    }], { individualHooks: true, returning: true });

    return serializeTraining(training, metadataFilePath);
  }

  async function updateTrainingById(id, payload) {
    const { title, metadataFilePath, status } = payload;

    const training = await Training.findByPk(id);
    if (!training) {
      throw new ErrorResponse(404, "Training not found");
    }

    const updates = {};

    if (isNotEmpty(title)) {
      updates.title = title;
    }

    if (Number.isInteger(status)) {
      if (!Object.values(TRAINING_STATUS).includes(status)) {
        throw new ErrorResponse(400, "Invalid training status");
      }

      updates.status = status;
    }

    if (isNotEmpty(metadataFilePath)) {
      const metadataFileId = await fileService.getFileIdByPath(metadataFilePath, { fieldName: "metadataFilePath" });
      updates.metadataFileId = metadataFileId;
    }

    await training.update(updates);

    return serializeTraining(training, metadataFilePath);
  }

  return {
    getTrainingById,
    createTraining,
    updateTrainingById,
  };
}
