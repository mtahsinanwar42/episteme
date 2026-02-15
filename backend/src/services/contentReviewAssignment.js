import { Op } from "sequelize";
import { canCreateReviewAssignment, canUpdateReviewAssignmentStatus, findReviewAssignments, findReviewAssignmentsBySearchFilters, findReviewAssignmentsByUserId } from "../repositories/contentReviewAssignment.js";
import { CONTENT_SUBMISSION_STATUS, REVIEW_ASSIGNMENT_STATUS, USER_ROLE, USER_STATUS } from "../utils/constants.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { isCurrentDateOrFuture, parseOptionalDateInput } from "../utils/dateTime.js";
import { isEmpty, isNotEmpty } from "../utils/string.js";
import { normalizeNumberArray, toOptionalDateText, toOptionalInteger } from "../utils/search.js";

export function createReviewAssignmentService({ ContentReviewAssignment, ContentSubmission, User, fileService, emailPublisher, notificationPublisher }) {
  if (!ContentReviewAssignment) {
    throw new Error("createReviewAssignmentService requires { ContentReviewAssignment } model");
  }

  if (!User) {
    throw new Error("createReviewAssignmentService requires { User } model");
  }

  if (!ContentSubmission) {
    throw new Error("createReviewAssignmentService requires { ContentSubmission } model");
  }

  if (!fileService) {
    throw new ErrorResponse("createReviewAssignmentService requires { fileService }");
  }

  if (!emailPublisher) {
    throw new Error("createReviewAssignmentService requires { emailPublisher }");
  }

  if (!notificationPublisher) {
    throw new Error("createReviewAssignmentService requires { notificationPublisher }");
  }

  function publishNotificationSafely(promise, context) {
    void promise.catch((err) => {
      console.error(`[notification] ${context} failed`, err);
    });
  }

  async function getMyReviewAssignments(user, page, limit) {
    return findReviewAssignmentsByUserId({ userId: user.id, page, limit });
  }

  async function getReviewAssignments(page, limit) {
    return findReviewAssignments({ page, limit });
  }

  async function searchReviewAssignments(user, filters) {
    const roles = Array.isArray(user.roles) ? user.roles : [];
    const isAdmin = roles.includes(USER_ROLE.ADMIN);
    const isReviewer = roles.includes(USER_ROLE.REVIEWER);

    const safeFormId = isEmpty(filters.formId) ? null : String(filters.formId).trim();
    const safeSubmissionTitle = isEmpty(filters.submissionTitle) ? null : String(filters.submissionTitle).trim();
    const safeSubmissionStatuses = normalizeNumberArray(filters.submissionStatuses, { fieldName: "submissionStatuses" });
    const safeAssignmentStatuses = normalizeNumberArray(filters.assignmentStatuses, { fieldName: "assignmentStatuses" });

    if (safeSubmissionStatuses != null && safeSubmissionStatuses.some((s) => !Object.values(CONTENT_SUBMISSION_STATUS).includes(s))) {
      throw new ErrorResponse(400, "Invalid submission status");
    }

    if (safeAssignmentStatuses != null && safeAssignmentStatuses.some((s) => !Object.values(REVIEW_ASSIGNMENT_STATUS).includes(s))) {
      throw new ErrorResponse(400, "Invalid assignment status");
    }

    if (isReviewer) {
      if (safeSubmissionStatuses?.includes(CONTENT_SUBMISSION_STATUS.DELETED)) {
        throw new ErrorResponse(400, "DELETED submission status is not accepted for reviewer search");
      }

      if (safeAssignmentStatuses?.includes(REVIEW_ASSIGNMENT_STATUS.DELETED)) {
        throw new ErrorResponse(400, "DELETED assignment status is not accepted for reviewer search");
      }
    }

    const safeConferenceId = toOptionalInteger(filters.conferenceId, { fieldName: "conferenceId" });
    const safeSubmissionId = toOptionalInteger(filters.submissionId, { fieldName: "submissionId" });
    const shouldPaginate = filters.paginate !== false;
    const safeAssignedByUsrIds = normalizeNumberArray(filters.assignedByUsrIds, { fieldName: "assignedByUsrIds" });

    const safeSubmissionOwnerUsrIds = normalizeNumberArray(filters.submissionOwnerUsrIds, { fieldName: "submissionOwnerUsrIds" });
    const safeReviewerUsrIds = normalizeNumberArray(filters.reviewerUsrIds, { fieldName: "reviewerUsrIds" });

    if (isReviewer && (safeSubmissionOwnerUsrIds != null || safeReviewerUsrIds != null || safeAssignedByUsrIds != null)) {
      throw new ErrorResponse(400, "submissionOwnerUsrIds, reviewerUsrIds and assignedByUsrIds are admin-only filters");
    }

    const safeAssignedDateFrom = toOptionalDateText(filters.assignedDateFrom, { fieldName: "assignedDateFrom" });
    const safeAssignedDateTo = toOptionalDateText(filters.assignedDateTo, { fieldName: "assignedDateTo" });
    const safeDueDateFrom = toOptionalDateText(filters.dueDateFrom, { fieldName: "dueDateFrom" });
    const safeDueDateTo = toOptionalDateText(filters.dueDateTo, { fieldName: "dueDateTo" });

    if (safeAssignedDateFrom && safeAssignedDateTo && safeAssignedDateFrom > safeAssignedDateTo) {
      throw new ErrorResponse(400, "assignedDateFrom cannot be greater than assignedDateTo");
    }

    if (safeDueDateFrom && safeDueDateTo && safeDueDateFrom > safeDueDateTo) {
      throw new ErrorResponse(400, "dueDateFrom cannot be greater than dueDateTo");
    }

    return findReviewAssignmentsBySearchFilters({
      loggedInUserId: user.id,
      loggedInUserRoles: roles,
      page: filters.page,
      limit: filters.limit,
      paginate: shouldPaginate,
      formId: safeFormId,
      submissionTitle: safeSubmissionTitle,
      submissionStatuses: safeSubmissionStatuses,
      submissionOwnerUsrIds: safeSubmissionOwnerUsrIds,
      conferenceId: safeConferenceId,
      submissionId: safeSubmissionId,
      reviewerUsrIds: safeReviewerUsrIds,
      assignmentStatuses: safeAssignmentStatuses,
      assignedByUsrIds: safeAssignedByUsrIds,
      assignedDateFrom: safeAssignedDateFrom,
      assignedDateTo: safeAssignedDateTo,
      dueDateFrom: safeDueDateFrom,
      dueDateTo: safeDueDateTo,
      isAdmin,
    });
  }

  async function saveReviewAssignment(user, payload) {
    const { contentSubmissionId, reviewerUsrId, assignedByNotes, dueAt } = payload;

    if (isNaN(contentSubmissionId) || isNaN(reviewerUsrId) || dueAt === undefined || dueAt === null) {
      throw new ErrorResponse(400, "contentSubmissionId, reviewerUsrId and dueAt are required");
    }

    let parsedDueAt = null;
    const parsedDueAtInput = parseOptionalDateInput(dueAt);

    if (parsedDueAtInput.isEmpty || parsedDueAtInput.isInvalid) {
      throw new ErrorResponse(400, "dueAt must be a valid date");
    }

    if (parsedDueAtInput.isProvided) {
      parsedDueAt = parsedDueAtInput.date;
      if (!isCurrentDateOrFuture(parsedDueAt)) {
        throw new ErrorResponse(400, "dueAt must be current date or future date");
      }
    }

    const { assignmentExists, submissionExists, reviewerExists } = await canCreateReviewAssignment({ contentSubmissionId, reviewerUsrId });

    if (!submissionExists) {
      throw new ErrorResponse(404, "ContentSubmission not found");
    }

    if (!reviewerExists) {
      throw new ErrorResponse(404, "Reviewer user not found");
    }

    if (assignmentExists) {
      throw new ErrorResponse(409, "Review assignment already exists");
    }

    const assignment = await ContentReviewAssignment.create({
      contentSubmissionId: Number(contentSubmissionId),
      reviewerUsrId: Number(reviewerUsrId),
      assignedByUsrId: Number(user.id),
      assignedByNotes: assignedByNotes ?? null,
      dueAt: parsedDueAt,
      status: REVIEW_ASSIGNMENT_STATUS.ASSIGNED,
    });

    await publishReviewAssignmentCreateEmail(user, {
      reviewerUsrId: Number(reviewerUsrId),
      contentSubmissionId: Number(contentSubmissionId),
      notes: assignedByNotes ?? null,
      dueAt: assignment.dueAt,
    });

    return assignment;
  }

  async function updateReviewAssignmentStatusById(user, id, payload) {
    const userId = Number(user.id);
    const userRoles = Array.isArray(user.roles) ? user.roles : [];
    const isAdmin = userRoles.includes(USER_ROLE.ADMIN);

    const { status, statusUpdateNotes, } = payload;
    const updates = {};

    if (!Object.values(REVIEW_ASSIGNMENT_STATUS).includes(status)) {
      throw new ErrorResponse(400, "Invalid assignment status");
    }

    if (isAdmin) {
      if (![
        REVIEW_ASSIGNMENT_STATUS.ASSIGNED,
        REVIEW_ASSIGNMENT_STATUS.CANCELLED,
        REVIEW_ASSIGNMENT_STATUS.DELETED,
      ].includes(status)) {
        throw new ErrorResponse(400, "Invalid assignment status");
      }
    } else {
      if (![
        REVIEW_ASSIGNMENT_STATUS.ACCEPTED,
        REVIEW_ASSIGNMENT_STATUS.DECLINED,
      ].includes(status)) {
        throw new ErrorResponse(400, "Invalid assignment status");
      }
    }

    updates.status = status;

    if (isAdmin && isNotEmpty(statusUpdateNotes)) {
      updates.statusUpdateNotes = statusUpdateNotes;
    }

    const where = isAdmin
      ? { id: Number(id) }
      : { id: Number(id), reviewerUsrId: userId };

    const assignment = await ContentReviewAssignment.findOne({ where });

    if (!assignment) {
      throw new ErrorResponse(404, "ContentReviewAssignment not found");
    }

    const oldStatus = assignment.status;
    const nonUpdatableStatuses = [
      REVIEW_ASSIGNMENT_STATUS.CANCELLED,
      REVIEW_ASSIGNMENT_STATUS.OVERDUE,
      REVIEW_ASSIGNMENT_STATUS.DELETED,
    ];
    const reviewerAllowedCurrentStatuses = [
      REVIEW_ASSIGNMENT_STATUS.ASSIGNED,
      REVIEW_ASSIGNMENT_STATUS.ACCEPTED,
      REVIEW_ASSIGNMENT_STATUS.DECLINED,
    ];

    if (nonUpdatableStatuses.includes(oldStatus)) {
      throw new ErrorResponse(400, "Cannot update cancelled/overdue/deleted review assignment.");
    }

    if (!isAdmin && !reviewerAllowedCurrentStatuses.includes(oldStatus)) {
      throw new ErrorResponse(400, "Cannot update review assignment from current status.");
    }

    if (!isAdmin && assignment.dueAt && new Date(assignment.dueAt) < new Date()) {
      throw new ErrorResponse(400, "Cannot update overdue review assignment.");
    }

    const { submissionExists } = await canUpdateReviewAssignmentStatus({
      contentSubmissionId: assignment.contentSubmissionId,
    });

    if (!submissionExists) {
      throw new ErrorResponse(400, "ContentSubmission should be in Pending Approval or Returned status");
    }

    await assignment.update(updates);

    if (isAdmin) {
      await publishReviewAssignmentUpdateStatusByAdminEmail(user, {
        oldStatus,
        newStatus: updates.status,
        reviewerUsrId: Number(assignment.reviewerUsrId),
        contentSubmissionId: Number(assignment.contentSubmissionId),
        notes: updates.statusUpdateNotes,
        dueAt: assignment.dueAt,
      });
    } else {
      await publishReviewAssignmentUpdateStatusByReviewerEmail(user, {
        oldStatus,
        newStatus: updates.status,
        contentSubmissionId: Number(assignment.contentSubmissionId),
        dueAt: assignment.dueAt,
      });
    }

    return assignment;
  }

  async function publishReviewAssignmentCreateEmail(user, { reviewerUsrId, contentSubmissionId, notes, dueAt, }) {
    const reviewer = await User.findByPk(reviewerUsrId);

    const submission = await ContentSubmission.findByPk(contentSubmissionId);
    const submissionTitle = submission.title;
    const submissionUrl = `${process.env.FRONTEND_BASE_URL}/submissions/${contentSubmissionId}/details`;

    const assignedBy = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    emailPublisher.publishReviewAssignmentCreateEmail(reviewer, {
      submissionTitle,
      submissionUrl,
      assignedBy,
      notes,
      dueAt,
    });
    publishNotificationSafely(notificationPublisher.publishReviewAssignmentCreatedNotification(reviewer, {
      submissionTitle,
      submissionId: contentSubmissionId,
    }), "publishReviewAssignmentCreatedNotification");
  }

  async function publishReviewAssignmentUpdateStatusByAdminEmail(user, { oldStatus, newStatus, reviewerUsrId, contentSubmissionId, notes, dueAt, }) {
    const reviewer = await User.findByPk(reviewerUsrId);
    const assignedBy = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    const submission = await ContentSubmission.findByPk(contentSubmissionId);
    const submissionTitle = submission.title;
    const submissionUrl = `${process.env.FRONTEND_BASE_URL}/submissions/${contentSubmissionId}/details`;

    emailPublisher.publishReviewAssignmentUpdateStatusByAdminEmail(reviewer, {
      oldStatus,
      newStatus,
      submissionTitle,
      submissionUrl: submission.currentStatus !== CONTENT_SUBMISSION_STATUS.DELETED && submissionUrl,
      assignedBy,
      notes,
      dueAt,
    });
    publishNotificationSafely(notificationPublisher.publishReviewAssignmentStatusUpdatedByAdminNotification(reviewer, {
      submissionTitle,
      submissionId: contentSubmissionId,
    }), "publishReviewAssignmentStatusUpdatedByAdminNotification");
  }

  async function publishReviewAssignmentUpdateStatusByReviewerEmail(user, { oldStatus, newStatus, contentSubmissionId, dueAt, }) {
    const admins = await User.findAll({
      where: {
        roles: {
          [Op.contains]: [USER_ROLE.ADMIN],
        },
        status: USER_STATUS.ACTIVE,
      },
    });

    const submission = await ContentSubmission.findByPk(contentSubmissionId);
    const submissionTitle = submission.title;
    const submissionUrl = `${process.env.FRONTEND_BASE_URL}/submissions/${contentSubmissionId}/details`;

    emailPublisher.publishReviewAssignmentUpdateStatusByReviewerEmail(admins, {
      oldStatus,
      newStatus,
      reviewer: user,
      submissionTitle,
      submissionUrl,
      dueAt,
    });
    publishNotificationSafely(notificationPublisher.publishReviewAssignmentStatusUpdatedByReviewerNotification(admins, {
      reviewer: user,
      submissionTitle,
      submissionId: contentSubmissionId,
    }), "publishReviewAssignmentStatusUpdatedByReviewerNotification");
  }

  return {
    getMyReviewAssignments,
    getReviewAssignments,
    searchReviewAssignments,
    saveReviewAssignment,
    updateReviewAssignmentStatusById,
  };
}
