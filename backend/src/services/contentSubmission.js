import { findSubmissionByIdAndUserDetails, findSubmissionsByUserDetails } from "../repositories/contentSubmission.js";
import { CONTENT_SUBMISSION_STATUS } from "../utils/constants.js";
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

  async function updateSubmissionStatusById(id, status) {
    if (!Object.values(CONTENT_SUBMISSION_STATUS).includes(status)) {
      throw new ErrorResponse(400, "Invalid ContentSubmission status");
    }

    const submission = await ContentSubmission.findByPk(id);

    if (!submission) {
      throw new ErrorResponse(404, "User not found");
    }

    await submission.update({ status });

    return submission;
  }

  return {
    getSubmissionsByUserIdAndRoles,
    getSubmissionById,
    updateSubmissionStatusById
  };
}
