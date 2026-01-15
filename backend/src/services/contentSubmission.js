import { findSubmissionByIdAndUserDetails, findSubmissionsByUserDetails } from "../repositories/contentSubmission.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export function createSubmissionService({ ContentSubmission, fileService }) {
  if (!ContentSubmission) {
    throw new Error("createSubmissionService requires { ContentSubmission } model");
  }

  if (!fileService) {
    throw new Error("createSubmissionService requires { fileService }");
  }

  async function getSubmissionsByUserIdAndRoles(user, { page, limit }) {
    return findSubmissionsByUserDetails({
      loggedInUserId: user.id,
      loggedInUserRoles: user.roles,
      page,
      limit,
    });
  }

  async function getSubmissionById(user, { submissionId }) {
    if (!submissionId) {
      throw new ErrorResponse(400, "id cannot be empty");
    }

    return findSubmissionByIdAndUserDetails({
      submissionId,
      loggedInUserId: user.id,
      loggedInUserRoles: user.roles,
    });
  }

  return {
    getSubmissionsByUserIdAndRoles,
    getSubmissionById,
  };
}
