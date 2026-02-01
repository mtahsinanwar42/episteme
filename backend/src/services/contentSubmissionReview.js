import { Op } from "sequelize";
import { sequelize } from "../config/db.js";
import { findReviewAssignmentBySubmissionIdAndReviewerUsrId } from "../repositories/contentReviewAssignment.js";
import { canCreateSubmissionReview, findSubmissionReviewersById, findSubmissionReviewsByIdAndUserDetails } from "../repositories/contentSubmissionReview.js";
import { findSubmissionVersionByIdAndUploaderUsrType } from "../repositories/contentSubmissionVersion.js";
import { REVIEW_ASSIGNMENT_STATUS, REVIEW_RECOMMENDATION, USER_ROLE, USER_STATUS } from "../utils/constants.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export function createSubmissionReviewService({ ContentReview, ContentSubmission, ContentSubmissionVersion, ContentReviewAssignment, User, fileService, emailPublisher }) {
  if (!ContentReview || !ContentSubmission || !ContentSubmissionVersion || !ContentReviewAssignment || !User) {
    throw new Error("createSubmissionReviewService requires { ContentSubmission, ContentSubmissionVersion, ContentReviewAssignment, ContentReview, User } model");
  }

  if (!fileService || !emailPublisher) {
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

    let review;

    await sequelize.transaction(async (t) => {
      review = await ContentReview.create({
        contentReviewAssignmentId: assignment.id,
        contentSubmissionVersionId: submission.currentContentSubmissionVersionId,
        reviewerContentSubmissionVersionId: reviewerContentSubmissionVersionId ?? null,
        comment: comment ?? null,
        recommendation,
      },
        { transaction: t }
      );

      await assignment.update(
        { status: REVIEW_ASSIGNMENT_STATUS.COMPLETED },
        { transaction: t }
      );
    });

    await publishSubmissionReviewCreateEmail(user, { review, submissionId });

    return review;
  }

  async function publishSubmissionReviewCreateEmail(user, { review, submissionId }) {
    const admins = await User.findAll({
      where: {
        roles: {
          [Op.contains]: [USER_ROLE.ADMIN],
        },
        status: USER_STATUS.ACTIVE,
      },
    });

    const submission = await ContentSubmission.findByPk(submissionId);
    const submissionTitle = submission.title;
    const submissionUrl = `${process.env.FRONTEND_BASE_URL}/submissions/${submissionId}`;

    emailPublisher.publishSubmissionReviewCreateEmail(admins, {
      reviewer: user,
      recommendation: review.recommendation,
      notes: review.comment,
      submissionTitle,
      submissionUrl,
    });
  }

  return {
    getSubmissionReviewsById,
    getSubmissionReviewersById,
    saveSubmissionReview,
  };
}
