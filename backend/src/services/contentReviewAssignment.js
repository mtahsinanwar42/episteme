import { canCreateReviewAssignment, findReviewAssignments, findReviewAssignmentsByUserId } from "../repositories/contentReviewAssignment.js";
import { REVIEW_ASSIGNMENT_STATUS, USER_ROLE } from "../utils/constants.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { isNotEmpty } from "../utils/string.js";

export function createReviewAssignmentService({ ContentReviewAssignment, fileService }) {
  if (!ContentReviewAssignment) {
    throw new Error("createReviewAssignmentService requires { ContentReviewAssignment } model");
  }

  if (!fileService) {
    throw new ErrorResponse("createReviewAssignmentService requires { fileService }");
  }

  async function getMyReviewAssignments(user, page, limit) {
    return findReviewAssignmentsByUserId({ userId: user.id, page, limit });
  }

  async function getReviewAssignments(page, limit) {
    return findReviewAssignments({ page, limit });
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

    if (!isAdmin
      && ![
        REVIEW_ASSIGNMENT_STATUS.ACCEPTED,
        REVIEW_ASSIGNMENT_STATUS.DECLINED,
        REVIEW_ASSIGNMENT_STATUS.COMPLETED,
      ].includes(status)
    ) {
      throw new ErrorResponse(400, "Invalid assignment status");
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

    await assignment.update(updates);

    return assignment;
  }


  return {
    getMyReviewAssignments,
    getReviewAssignments,
    saveReviewAssignment,
    updateReviewAssignmentStatusById,
  };
}
