import { canCreateSubmissionMessage, findSubmissionMessagesByIdAndUserDetails } from "../repositories/contentSubmissionMessage.js";
import { CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE, USER_ROLE } from "../utils/constants.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { isEmpty } from "../utils/string.js";

export function createSubmissionMessageService({ ContentSubmissionMessage, fileService }) {
  if (!ContentSubmissionMessage) {
    throw new Error("createSubmissionMessageService requires { ContentSubmissionMessage } model");
  }

  if (!fileService) {
    throw new Error("createSubmissionMessageService requires { fileService }");
  }

  async function getSubmissionMessagesById(user, { submissionId }) {
    if (!submissionId) {
      throw new ErrorResponse(400, "id cannot be empty");
    }

    return findSubmissionMessagesByIdAndUserDetails({
      submissionId,
      loggedInUserId: user.id,
      loggedInUserRoles: user.roles,
    });
  }

  async function saveSubmissionMessage(user, submissionId, payload) {
    const roles = Array.isArray(user.roles) ? user.roles : [];
    const isAdmin = roles.includes(USER_ROLE.ADMIN);
    const isReviewer = roles.includes(USER_ROLE.REVIEWER);

    const { message, scope, receiverUsrId } = payload;

    if (!submissionId || isEmpty(message)) {
      throw new ErrorResponse(400, "submissionId, message are required");
    }

    if (!scope || !Object.values(CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE).includes(String(scope))) {
      throw new ErrorResponse(400, "Invalid scope");
    }

    if (isAdmin && (!receiverUsrId || isNaN(receiverUsrId))) {
      throw new ErrorResponse(400, "receiverUsrId is required for ADMIN");
    }

    const checks = await canCreateSubmissionMessage({
      submissionId,
      loggedInUserId: user.id,
      receiverUsrId: receiverUsrId,
    });

    if (!checks?.submissionExists) {
      throw new ErrorResponse(404, "ContentSubmission not found");
    }

    if (isAdmin) {
      return saveSubmissionMessageForAdmin({ user, submissionId, payload, checks });
    } else if (isReviewer) {
      return saveSubmissionMessageForReviewer({ user, submissionId, payload, checks });
    } else {
      return saveSubmissionMessageForUser({ user, submissionId, payload, checks });
    }
  }

  async function saveSubmissionMessageForAdmin({ user, submissionId, payload, checks }) {
    const { message, scope, receiverUsrId } = payload;

    if (scope === CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.USER_ADMIN && !checks.adminReceiverIsOwner) {
      throw new ErrorResponse(400, "receiverUsrId must be the submission owner");
    }

    if (scope === CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.ADMIN_REVIEWER && !checks.adminReceiverIsAssignedReviewer) {
      throw new ErrorResponse(400, "receiverUsrId must be an assigned reviewer for REVIEWER_ADMIN scope");
    }

    return ContentSubmissionMessage.create({
      contentSubmissionId: Number(submissionId),
      senderUsrId: Number(user.id),
      senderUsrType: USER_ROLE.ADMIN,
      receiverUsrId: Number(receiverUsrId),
      visibilityScope: scope,
      message,
    });
  }

  async function saveSubmissionMessageForReviewer({ user, submissionId, payload, checks }) {
    const { message, scope } = payload;

    if (!checks.isAssignedReviewer) {
      throw new ErrorResponse(403, "Not authorized to message on this submission");
    }

    if (scope !== CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.ADMIN_REVIEWER) {
      throw new ErrorResponse(400, "REVIEWER can only use REVIEWER_ADMIN scope");
    }

    return ContentSubmissionMessage.create({
      contentSubmissionId: Number(submissionId),
      senderUsrId: Number(user.id),
      senderUsrType: USER_ROLE.REVIEWER,
      visibilityScope: CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.ADMIN_REVIEWER,
      message,
    });
  }

  async function saveSubmissionMessageForUser({ user, submissionId, payload, checks }) {
    const { message, scope } = payload;

    if (!checks.isOwner) {
      throw new ErrorResponse(403, "Not authorized to message on this submission");
    }

    if (scope !== CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.USER_ADMIN) {
      throw new ErrorResponse(400, "USER can only use USER_ADMIN scope");
    }

    return ContentSubmissionMessage.create({
      contentSubmissionId: Number(submissionId),
      senderUsrId: Number(user.id),
      senderUsrType: USER_ROLE.USER,
      visibilityScope: CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.USER_ADMIN,
      message,
    });
  }


  return {
    getSubmissionMessagesById,
    saveSubmissionMessage,
  };
}
