import { findSubmissionMessagesByIdAndUserDetails } from "../repositories/contentSubmissionMessage.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export function createSubmissionMessageService({ ContentSubmissionMessage, fileService }) {
  if (!ContentSubmissionMessage) {
    throw new Error("createSubmissionMessageService requires { ContentSubmissionMessage } model");
  }

  if (!fileService) {
    throw new Error("createSubmissionMessageService requires { fileService }");
  }

  async function getSubmissionMessagesById(user, { submissionId }) {
    if (!submissionId) {
      throw new ErrorResponse(400, "id cannot be empty");
    }

    return findSubmissionMessagesByIdAndUserDetails({
      submissionId,
      loggedInUserId: user.id,
      loggedInUserRoles: user.roles,
    });
  }

  return {
    getSubmissionMessagesById,
  };
}
