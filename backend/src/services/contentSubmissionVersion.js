import { findSubmissionVersionsByIdAndUserDetails } from "../repositories/contentSubmissionVersion.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export function createSubmissionVersionService({ ContentSubmissionVersion, fileService }) {
  if (!ContentSubmissionVersion) {
    throw new Error("createSubmissionVersionService requires { ContentSubmissionVersion } model");
  }

  if (!fileService) {
    throw new Error("createSubmissionVersionService requires { fileService }");
  }

  async function getSubmissionVersionsById(user, { submissionId }) {
    if (!submissionId) {
      throw new ErrorResponse(400, "id cannot be empty");
    }

    return findSubmissionVersionsByIdAndUserDetails({
      submissionId,
      loggedInUserId: user.id,
      loggedInUserRoles: user.roles,
    });
  }

  return {
    getSubmissionVersionsById,
  };
}
