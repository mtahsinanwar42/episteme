import { Op } from "sequelize";
import { sequelize } from "../config/db.js";
import { findSubmissionByIdAndUserDetails, findSubmissionsBySearchFilters, findSubmissionsByUserDetails, generateFormId, markSubmissionAsApprovedOrRejected, markSubmissionAsDeleted, markSubmissionAsStatus } from "../repositories/contentSubmission.js";
import { CONFERENCE_STATUS, CONTENT_SUBMISSION_PAYMENT_STATUS, CONTENT_SUBMISSION_SRC_PREFIX, CONTENT_SUBMISSION_STATUS, CONTENT_SUBMISSION_UPLOADER_USER_TYPE, CONTENT_SUBMISSION_VERSION_INITIAL, USER_ROLE, USER_STATUS } from "../utils/constants.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { serializeContentSubmission } from "../utils/serializers.js";
import { toDate } from "../utils/dateTime.js";
import { isEmpty } from "../utils/string.js";
import { normalizeNumberArray, normalizeTextArray, toOptionalDateText, toOptionalInteger } from "../utils/search.js";

export function createSubmissionService({ ContentSubmission, ContentSubmissionPayment, ContentSubmissionVersion, User, conferenceService, fileService, emailPublisher, notificationPublisher }) {
  if (!ContentSubmission || !ContentSubmissionVersion || !User) {
    throw new Error("createSubmissionService requires { ContentSubmission, ContentSubmissionPayment, ContentSubmissionVersion, User } model");
  }

  if (!fileService) {
    throw new Error("createSubmissionService requires { fileService }");
  }

  if (!emailPublisher) {
    throw new Error("createSubmissionService requires { emailPublisher }");
  }

  if (!notificationPublisher) {
    throw new Error("createSubmissionService requires { notificationPublisher }");
  }

  function publishNotificationSafely(promise, context) {
    void promise.catch((err) => {
      console.error(`[notification] ${context} failed`, err);
    });
  }

  async function getSubmissionsByUserIdAndRoles(user, { page, limit }) {
    return findSubmissionsByUserDetails({
      loggedInUserId: user.id,
      loggedInUserRoles: user.roles,
      page,
      limit,
    });
  }

  async function searchSubmissions(user, filters) {
    const roles = Array.isArray(user.roles) ? user.roles : [];
    const isAdmin = roles.includes(USER_ROLE.ADMIN);

    const safeFormId = isEmpty(filters.formId) ? null : String(filters.formId).trim();
    const safeTitle = isEmpty(filters.title) ? null : String(filters.title).trim();
    const safeDoi = isEmpty(filters.doi) ? null : String(filters.doi).trim();

    const safeTopics = normalizeTextArray(filters.topics, { fieldName: "topics" });
    const safeStatuses = normalizeNumberArray(filters.status, { fieldName: "status" });
    const allStatuses = Object.values(CONTENT_SUBMISSION_STATUS);

    if (safeStatuses != null && safeStatuses.some((s) => !allStatuses.includes(s))) {
      throw new ErrorResponse(400, "Invalid ContentSubmission status");
    }

    if (!isAdmin && safeStatuses?.includes(CONTENT_SUBMISSION_STATUS.DELETED)) {
      throw new ErrorResponse(400, "DELETED status is not accepted for user search");
    }

    const safeConferenceId = toOptionalInteger(filters.conferenceId, { fieldName: "conferenceId" });
    const safeOwnerUsrIds = normalizeNumberArray(filters.ownerUsrIds, { fieldName: "ownerUsrIds" });
    const shouldPaginate = filters.paginate !== false;

    if (!isAdmin && safeOwnerUsrIds != null) {
      throw new ErrorResponse(400, "ownerUsrIds can only be provided by admin");
    }

    const safeCreatedDateFrom = toOptionalDateText(filters.createdDateFrom, { fieldName: "createdDateFrom" });
    const safeCreatedDateTo = toOptionalDateText(filters.createdDateTo, { fieldName: "createdDateTo" });

    if (safeCreatedDateFrom && safeCreatedDateTo && safeCreatedDateFrom > safeCreatedDateTo) {
      throw new ErrorResponse(400, "createdDateFrom cannot be greater than createdDateTo");
    }

    return findSubmissionsBySearchFilters({
      loggedInUserId: user.id,
      loggedInUserRoles: roles,
      page: filters.page,
      limit: filters.limit,
      paginate: shouldPaginate,
      formId: safeFormId,
      title: safeTitle,
      topics: safeTopics,
      doi: safeDoi,
      conferenceId: safeConferenceId,
      statuses: safeStatuses,
      ownerUsrIds: isAdmin ? safeOwnerUsrIds : [user.id],
      createdDateFrom: safeCreatedDateFrom,
      createdDateTo: safeCreatedDateTo,
      excludeDeleted: !isAdmin,
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
    const { title, abstract, topics, conferenceId, contentFilePath, message, } = payload;

    if (isEmpty(title) || isEmpty(abstract) || !conferenceId || isEmpty(contentFilePath)) {
      throw new ErrorResponse(400, "title, abstract, conferenceId, contentFilePath are required");
    }

    if (!Array.isArray(topics) || topics.length === 0 || topics.some((t) => t == null)) {
      throw new ErrorResponse(400, "topics is required");
    }

    const conference = await conferenceService.getConferenceById(conferenceId);

    if (!conference || conference.status !== CONFERENCE_STATUS.ACTIVE) {
      throw new ErrorResponse(400, "Invalid Conference ID");
    }

    const now = new Date();
    const submissionPeriodStartAt = toDate(conference.submissionPeriodStartAt);
    const submissionPeriodEndAt = toDate(conference.submissionPeriodEndAt);

    if (now < submissionPeriodStartAt || now > submissionPeriodEndAt) {
      throw new ErrorResponse(
        400,
        `Submission is not allowed outside the conference submission period. Valid range: ${submissionPeriodStartAt.toISOString()} to ${submissionPeriodEndAt.toISOString()}`
      );
    }

    const contentFileId = await fileService.getFileIdByPath(contentFilePath, { fieldName: "contentFilePath" });

    return sequelize.transaction(async (t) => {
      const formId = await generateFormId({
        startAt: conference.startAt,
        srcPrefix: CONTENT_SUBMISSION_SRC_PREFIX.CONFERENCE,
        t,
      });

      const submission = await ContentSubmission.create(
        {
          formId,
          title,
          abstract,
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
    const submissionUrl = `${process.env.FRONTEND_BASE_URL}/submissions/${submission.id}/details`;

    emailPublisher.publishSubmissionCreateToUserEmail(user, {
      submissionTitle: submission.title,
      submissionUrl,
    });
    emailPublisher.publishSubmissionCreateToAdminsEmail(admins, {
      user,
      submissionTitle: submission.title,
      submissionUrl,
    });
    publishNotificationSafely(notificationPublisher.publishSubmissionCreatedToAdminNotification(admins, {
      user,
      submissionTitle: submission.title,
      submissionId: submission.id,
    }), "publishSubmissionCreatedToAdminNotification");
  }

  async function publishSubmissionStatusUpdateEmail({ submission, oldStatus, newStatus, notes }) {
    const user = await User.findByPk(submission.ownerUsrId);
    const submissionUrl = `${process.env.FRONTEND_BASE_URL}/submissions/${submission.id}/details`;

    emailPublisher.publishSubmissionStatusUpdatedMail(user, {
      oldStatus,
      newStatus,
      notes,
      submissionTitle: submission.title,
      submissionUrl,
    });
    publishNotificationSafely(notificationPublisher.publishSubmissionStatusUpdatedNotification(user, {
      submissionTitle: submission.title,
      submissionId: submission.id,
      oldStatus,
      newStatus,
    }), "publishSubmissionStatusUpdatedNotification");
  }

  return {
    getSubmissionsByUserIdAndRoles,
    searchSubmissions,
    getSubmissionById,
    saveSubmission,
    updateSubmissionDoiById,
    updateSubmissionStatusById
  };
}
