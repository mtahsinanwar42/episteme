import { sequelize } from "../config/db.js";
import { findReviewAssignmentBySubmissionIdAndReviewerUsrId } from "../repositories/contentReviewAssignment.js";
import { canCreateSubmissionReview, findSubmissionReviewersById, findSubmissionReviewsByIdAndUserDetails } from "../repositories/contentSubmissionReview.js";
import { findSubmissionVersionByIdAndUploaderUsrType } from "../repositories/contentSubmissionVersion.js";
import { REVIEW_ASSIGNMENT_STATUS, REVIEW_RECOMMENDATION, USER_ROLE } from "../utils/constants.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export function createSubmissionReviewService({ ContentReview, ContentSubmission, ContentSubmissionVersion, ContentReviewAssignment, fileService }) {
  if (!ContentReview || !ContentSubmission || !ContentSubmissionVersion || !ContentReviewAssignment) {
    throw new Error("createSubmissionReviewService requires { ContentSubmission, ContentSubmissionVersion, ContentReviewAssignment, ContentReview } model");
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

  async function getSubmissionReviewersById(submissionId, page, limit) {
    if (!submissionId) {
      throw new ErrorResponse(400, "id cannot be empty");
    }

    return findSubmissionReviewersById({ submissionId, page, limit });
  }

  async function saveSubmissionReview(user, submissionId, payload) {
    const { reviewerContentSubmissionVersionId, comment, recommendation } = payload;

    if (!Object.values(REVIEW_RECOMMENDATION).includes(recommendation)) {
      throw new ErrorResponse(400, "Invalid recommendation");
    }

    const checks = await canCreateSubmissionReview({ submissionId, loggedInUserId: user.id });

    if (!checks?.submissionExists || !checks?.isAssignedReviewer) {
      throw new ErrorResponse(404, "submission not found");
    }

    if (reviewerContentSubmissionVersionId) {
      const reviewerVersion = await findSubmissionVersionByIdAndUploaderUsrType({ ContentSubmissionVersion, id: reviewerContentSubmissionVersionId, uploaderUsrType: USER_ROLE.REVIEWER });

      if (!reviewerVersion) {
        throw new ErrorResponse(404, "reviewerContentSubmissionVersionId not found");
      }
    }

    const submission = await ContentSubmission.findOne({
      where: {
        id: Number(submissionId),
      }
    });
    const assignment = await findReviewAssignmentBySubmissionIdAndReviewerUsrId({
      ContentReviewAssignment,
      contentSubmissionId: submissionId,
      reviewerUsrId: user.id,
    });

    if (!submission || !assignment) {
      throw new ErrorResponse(404, "submission/assignment not found");
    }

    return sequelize.transaction(async (t) => {
      const review = await ContentReview.create({
        contentReviewAssignmentId: assignment.id,
        contentSubmissionVersionId: submission.currentContentSubmissionVersionId,
        reviewerContentSubmissionVersionId,
        comment: comment ?? null,
        recommendation,
      },
        { transaction: t }
      );

      await assignment.update(
        { status: REVIEW_ASSIGNMENT_STATUS.COMPLETED },
        { transaction: t }
      );

      return review;
    });
  }

  return {
    getSubmissionReviewsById,
    getSubmissionReviewersById,
    saveSubmissionReview,
  };
}
