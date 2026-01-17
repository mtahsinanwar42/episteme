import { findSubmissionReviewersById, findSubmissionReviewsByIdAndUserDetails } from "../repositories/contentSubmissionReview.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export function createSubmissionReviewService({ ContentReview, fileService }) {
  if (!ContentReview) {
    throw new Error("createSubmissionReviewService requires { ContentReview } model");
  }

  if (!fileService) {
    throw new Error("createSubmissionReviewService requires { fileService }");
  }

  async function getSubmissionReviewsById(user, { submissionId }) {
    if (!submissionId) {
      throw new ErrorResponse(400, "id cannot be empty");
    }

    return findSubmissionReviewsByIdAndUserDetails({
      submissionId,
      loggedInUserId: user.id,
      loggedInUserRoles: user.roles,
    });
  }

  async function getSubmissionReviewersById(submissionId) {
    if (!submissionId) {
      throw new ErrorResponse(400, "id cannot be empty");
    }

    return findSubmissionReviewersById(submissionId);
  }

  return {
    getSubmissionReviewsById,
    getSubmissionReviewersById
  };
}
