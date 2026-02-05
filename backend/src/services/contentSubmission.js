import { Op } from "sequelize";
import { sequelize } from "../config/db.js";
import { findSubmissionByIdAndUserDetails, findSubmissionsByUserDetails, markSubmissionAsApprovedOrRejected, markSubmissionAsDeleted, markSubmissionAsStatus } from "../repositories/contentSubmission.js";
import { CONFERENCE_STATUS, CONTENT_SUBMISSION_PAYMENT_STATUS, CONTENT_SUBMISSION_STATUS, CONTENT_SUBMISSION_UPLOADER_USER_TYPE, CONTENT_SUBMISSION_VERSION_INITIAL, USER_ROLE, USER_STATUS } from "../utils/constants.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { serializeContentSubmission } from "../utils/serializers.js";
import { isEmpty } from "../utils/string.js";

export function createSubmissionService({ ContentSubmission, ContentSubmissionPayment, ContentSubmissionVersion, User, conferenceService, fileService, emailPublisher }) {
  if (!ContentSubmission || !ContentSubmissionVersion || !User) {
    throw new Error("createSubmissionService requires { ContentSubmission, ContentSubmissionPayment, ContentSubmissionVersion, User } model");
  }

  if (!fileService) {
    throw new Error("createSubmissionService requires { fileService }");
  }

  if (!emailPublisher) {
    throw new Error("createSubmissionService requires { emailPublisher }");
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

    if (!Array.isArray(topics) || topics.length === 0 || topics.some((t) => t == null)) {
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

      await publishSubmissionCreateEmails(user, { submission });

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

    if (!Object.values(CONTENT_SUBMISSION_STATUS).includes(status)) {
      throw new ErrorResponse(400, "Invalid ContentSubmission status");
    }

    const where = { id };
    const submission = await ContentSubmission.findOne({ where });

    if (!submission) {
      throw new ErrorResponse(404, "ContentSubmission not found");
    }

    if ([
      CONTENT_SUBMISSION_STATUS.APPROVED,
      CONTENT_SUBMISSION_STATUS.REJECTED,
      CONTENT_SUBMISSION_STATUS.DELETED
    ].includes(submission.currentStatus)) {
      throw new ErrorResponse(400, "cannot update approved/rejected/deleted submission.");
    }

    const oldStatus = submission.currentStatus;

    await sequelize.transaction(async (t) => {
      if (status === CONTENT_SUBMISSION_STATUS.DELETED) {
        await markSubmissionAsDeleted(
          { submissionId: id, statusUpdateNotes },
          { t }
        );
      } else if ([
        CONTENT_SUBMISSION_STATUS.APPROVED,
        CONTENT_SUBMISSION_STATUS.REJECTED
      ].includes(status)) {
        await markSubmissionAsApprovedOrRejected(
          { submissionId: id, status, statusUpdateNotes },
          { t }
        );
      } else {
        await markSubmissionAsStatus(
          { submissionId: id, status, statusUpdateNotes },
          { t }
        );
      }
    });

    submission.set("currentStatus", status);
    submission.set("statusUpdateNotes", statusUpdateNotes ?? null);

    await publishSubmissionStatusUpdateEmail({
      submission,
      oldStatus,
      newStatus: status,
      notes: statusUpdateNotes,
    });

    return submission;
  }

  async function publishSubmissionCreateEmails(user, { submission, }) {
    const admins = await User.findAll({
      where: {
        roles: {
          [Op.contains]: [USER_ROLE.ADMIN],
        },
        status: USER_STATUS.ACTIVE,
      },
    });
    const submissionUrl = `${process.env.FRONTEND_BASE_URL}/submissions/${submission.id}`;

    emailPublisher.publishSubmissionCreateToUserEmail(user, {
      submissionTitle: submission.title,
      submissionUrl,
    });
    emailPublisher.publishSubmissionCreateToAdminsEmail(admins, {
      user,
      submissionTitle: submission.title,
      submissionUrl,
    });
  }

  async function publishSubmissionStatusUpdateEmail({ submission, oldStatus, newStatus, notes }) {
    const user = await User.findByPk(submission.ownerUsrId);
    const submissionUrl = `${process.env.FRONTEND_BASE_URL}/submissions/${submission.id}`;

    emailPublisher.publishSubmissionStatusUpdatedMail(user, {
      oldStatus,
      newStatus,
      notes,
      submissionTitle: submission.title,
      submissionUrl,
    });
  }

  return {
    getSubmissionsByUserIdAndRoles,
    getSubmissionById,
    saveSubmission,
    updateSubmissionDoiById,
    updateSubmissionStatusById
  };
}
