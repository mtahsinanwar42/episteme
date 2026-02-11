import { Op } from "sequelize";
import { canCreateReviewAssignment, canUpdateReviewAssignmentStatus, findReviewAssignments, findReviewAssignmentsBySearchFilters, findReviewAssignmentsByUserId } from "../repositories/contentReviewAssignment.js";
import { CONTENT_SUBMISSION_STATUS, REVIEW_ASSIGNMENT_STATUS, USER_ROLE, USER_STATUS } from "../utils/constants.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { isEmpty, isNotEmpty } from "../utils/string.js";
import { normalizeNumberArray, toOptionalDateText, toOptionalInteger } from "../utils/search.js";

export function createReviewAssignmentService({ ContentReviewAssignment, ContentSubmission, User, fileService, emailPublisher }) {
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
    const safeAssignedByUsrIds = normalizeNumberArray(filters.assignedByUsrIds, { fieldName: "assignedByUsrIds" });

    const safeSubmissionOwnerUsrIds = normalizeNumberArray(filters.submissionOwnerUsrIds, { fieldName: "submissionOwnerUsrIds" });
    const safeReviewerUsrIds = normalizeNumberArray(filters.reviewerUsrIds, { fieldName: "reviewerUsrIds" });

    if (isReviewer && (safeSubmissionOwnerUsrIds != null || safeReviewerUsrIds != null || safeAssignedByUsrIds != null)) {
      throw new ErrorResponse(400, "submissionOwnerUsrIds, reviewerUsrIds and assignedByUsrIds are admin-only filters");
    }

    const safeAssignedDateFrom = toOptionalDateText(filters.assignedDateFrom, { fieldName: "assignedDateFrom" });
    const safeAssignedDateTo = toOptionalDateText(filters.assignedDateTo, { fieldName: "assignedDateTo" });

    if (safeAssignedDateFrom && safeAssignedDateTo && safeAssignedDateFrom > safeAssignedDateTo) {
      throw new ErrorResponse(400, "assignedDateFrom cannot be greater than assignedDateTo");
    }

    return findReviewAssignmentsBySearchFilters({
      loggedInUserId: user.id,
      loggedInUserRoles: roles,
      page: filters.page,
      limit: filters.limit,
      submissionTitle: safeSubmissionTitle,
      submissionStatuses: safeSubmissionStatuses,
      submissionOwnerUsrIds: safeSubmissionOwnerUsrIds,
      conferenceId: safeConferenceId,
      reviewerUsrIds: safeReviewerUsrIds,
      assignmentStatuses: safeAssignmentStatuses,
      assignedByUsrIds: safeAssignedByUsrIds,
      assignedDateFrom: safeAssignedDateFrom,
      assignedDateTo: safeAssignedDateTo,
      isAdmin,
    });
  }

  async function saveReviewAssignment(user, payload) {
    const { contentSubmissionId, reviewerUsrId, assignedByNotes } = payload;

    if (isNaN(contentSubmissionId) || isNaN(reviewerUsrId)) {
      throw new ErrorResponse(404, "contentSubmissionId and reviewerUsrId are required");
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
      status: REVIEW_ASSIGNMENT_STATUS.ASSIGNED,
    });

    await publishReviewAssignmentCreateEmail(user, {
      reviewerUsrId: Number(reviewerUsrId),
      contentSubmissionId: Number(contentSubmissionId),
      notes: assignedByNotes ?? null,
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

    if ([REVIEW_ASSIGNMENT_STATUS.CANCELLED, REVIEW_ASSIGNMENT_STATUS.DELETED].includes(assignment.status)) {
      throw new ErrorResponse(400, "Cannot update cancelled/deleted review assignment.");
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
      });
    } else {
      await publishReviewAssignmentUpdateStatusByReviewerEmail(user, {
        oldStatus,
        newStatus: updates.status,
        contentSubmissionId: Number(assignment.contentSubmissionId),
      });
    }

    return assignment;
  }

  async function publishReviewAssignmentCreateEmail(user, { reviewerUsrId, contentSubmissionId, notes, }) {
    const reviewer = await User.findByPk(reviewerUsrId);

    const submission = await ContentSubmission.findByPk(contentSubmissionId);
    const submissionTitle = submission.title;
    const submissionUrl = `${process.env.FRONTEND_BASE_URL}/submissions/${contentSubmissionId}`;

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
    })
  }

  async function publishReviewAssignmentUpdateStatusByAdminEmail(user, { oldStatus, newStatus, reviewerUsrId, contentSubmissionId, notes, }) {
    const reviewer = await User.findByPk(reviewerUsrId);
    const assignedBy = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    const submission = await ContentSubmission.findByPk(contentSubmissionId);
    const submissionTitle = submission.title;
    const submissionUrl = `${process.env.FRONTEND_BASE_URL}/submissions/${contentSubmissionId}`;

    emailPublisher.publishReviewAssignmentUpdateStatusByAdminEmail(reviewer, {
      oldStatus,
      newStatus,
      submissionTitle,
      submissionUrl: submission.status !== CONTENT_SUBMISSION_STATUS.DELETED && submissionUrl,
      assignedBy,
      notes,
    });
  }

  async function publishReviewAssignmentUpdateStatusByReviewerEmail(user, { oldStatus, newStatus, contentSubmissionId, }) {
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
    const submissionUrl = `${process.env.FRONTEND_BASE_URL}/submissions/${contentSubmissionId}`;

    emailPublisher.publishReviewAssignmentUpdateStatusByReviewerEmail(admins, {
      oldStatus,
      newStatus,
      reviewer: user,
      submissionTitle,
      submissionUrl,
    });
  }

  return {
    getMyReviewAssignments,
    getReviewAssignments,
    searchReviewAssignments,
    saveReviewAssignment,
    updateReviewAssignmentStatusById,
  };
}
