import { sequelize } from "../config/db.js";
import { findSubmissionByIdAndUserDetails, findSubmissionsByUserDetails } from "../repositories/contentSubmission.js";
import { CONFERENCE_STATUS, CONTENT_SUBMISSION_PAYMENT_STATUS, CONTENT_SUBMISSION_STATUS, CONTENT_SUBMISSION_UPLOADER_USER_TYPE, CONTENT_SUBMISSION_VERSION_INITIAL, USER_ROLE } from "../utils/constants.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { serializeContentSubmission } from "../utils/serializers.js";
import { isEmpty, isNotEmpty } from "../utils/string.js";

export function createSubmissionService({ ContentSubmission, ContentSubmissionPayment, ContentSubmissionVersion, conferenceService, fileService }) {
  if (!ContentSubmission || !ContentSubmissionVersion) {
    throw new Error("createSubmissionService requires { ContentSubmission, ContentSubmissionPayment, ContentSubmissionVersion } model");
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

  async function saveSubmission(user, payload) {
    const { title, topics, conferenceId, contentFilePath, message, } = payload;

    if (isEmpty(title) || !conferenceId || isEmpty(contentFilePath)) {
      throw new ErrorResponse(400, "title, conferenceId, contentFilePath are required");
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      throw new ErrorResponse(400, "topics is required");
    }

    const conference = await conferenceService.getConferenceById(conferenceId);

    if (!conference || conference.status !== CONFERENCE_STATUS.ACTIVE) {
      throw new ErrorResponse(400, "Invalid Conference ID");
    }

    const contentFileId = await fileService.getFileIdByPath(contentFilePath, { fieldName: "contentFilePath" });

    return sequelize.transaction(async (t) => {
      const submission = await ContentSubmission.create(
        {
          title,
          topics,
          conferenceId,
          currentStatus: CONTENT_SUBMISSION_STATUS.PENDING_APPROVAL, // TODO: change it to DRAFT after real payment integration
          ownerUsrId: user.id,
        },
        { transaction: t }
      );

      // TODO: Remove it after real payment integration
      const payment = await ContentSubmissionPayment.create(
        {
          contentSubmissionId: submission.id,
          usrId: user.id,
          amount: 500.0,
          currency: "BDT",
          provider: "bKash",
          providerPaymentId: "bKash_test_xyz",
          status: CONTENT_SUBMISSION_PAYMENT_STATUS.CAPTURED,
        },
        { transaction: t }
      );

      const version = await ContentSubmissionVersion.create(
        {
          contentSubmissionId: submission.id,
          changeLog: message,
          fileId: contentFileId,
          uploaderUsrId: user.id,
          uploaderUsrType: CONTENT_SUBMISSION_UPLOADER_USER_TYPE.USER,
          versionNo: CONTENT_SUBMISSION_VERSION_INITIAL,
        },
        { transaction: t }
      );

      await submission.update(
        { currentContentSubmissionVersionId: version.id },
        { transaction: t }
      );

      return serializeContentSubmission(submission, version, contentFilePath);
    });
  }

  async function updateSubmissionDoiById(id, doi) {
    if (isEmpty(doi)) {
      throw new ErrorResponse(400, "DOI should not be empty");
    }

    const where = { id };
    const submission = await ContentSubmission.findOne({
      where,
    });

    if (submission.currentStatus !== CONTENT_SUBMISSION_STATUS.APPROVED) {
      throw new ErrorResponse(400, "DOI should be set for approved submissions.");
    }

    await submission.update({ doi });

    return submission;
  }

  async function updateSubmissionStatusById(user, id, payload) {
    const { status, statusUpdateNotes, } = payload;
    const updates = {};

    if (!Object.values(CONTENT_SUBMISSION_STATUS).includes(status)) {
      throw new ErrorResponse(400, "Invalid ContentSubmission status");
    }

    updates.currentStatus = status;

    if (isNotEmpty(statusUpdateNotes)) {
      updates.statusUpdateNotes = statusUpdateNotes;
    }

    const where = { id };
    const submission = await ContentSubmission.findOne({
      where,
    });

    if (!submission) {
      throw new ErrorResponse(404, "ContentSubmission not found");
    }

    await submission.update(updates);

    return submission;
  }

  return {
    getSubmissionsByUserIdAndRoles,
    getSubmissionById,
    saveSubmission,
    updateSubmissionDoiById,
    updateSubmissionStatusById
  };
}
