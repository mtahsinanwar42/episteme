import { QueryTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { canCreateSubmissionVersion, findSubmissionVersionsByIdAndUserDetails } from "../repositories/contentSubmissionVersion.js";
import { CONTENT_SUBMISSION_STATUS, CONTENT_SUBMISSION_VERSION_INITIAL, USER_ROLE } from "../utils/constants.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { isEmpty } from "../utils/string.js";

export function createSubmissionVersionService({ ContentSubmissionVersion, ContentSubmission, fileService }) {
  if (!ContentSubmissionVersion) {
    throw new Error("createSubmissionVersionService requires { ContentSubmissionVersion, ContentSubmission } model");
  }

  if (!fileService) {
    throw new Error("createSubmissionVersionService requires { fileService }");
  }

  async function getSubmissionVersionsById(user, { submissionId }) {
    if (!submissionId) {
      throw new ErrorResponse(400, "id cannot be empty");
    }

    return findSubmissionVersionsByIdAndUserDetails({
      submissionId,
      loggedInUserId: user.id,
      loggedInUserRoles: user.roles,
    });
  }

  async function saveSubmissionVersion(user, submissionId, payload) {
    const roles = Array.isArray(user.roles) ? user.roles : [];
    const isAdmin = roles.includes(USER_ROLE.ADMIN);
    const isReviewer = roles.includes(USER_ROLE.REVIEWER);

    const { contentFilePath, message } = payload;

    if (isNaN(submissionId) || isEmpty(contentFilePath)) {
      throw new ErrorResponse(400, "submissionId, contentFilePath are required");
    }

    const checks = await canCreateSubmissionVersion({
      submissionId: Number(submissionId),
      loggedInUserId: Number(user.id),
    });

    if (!checks?.submissionExists) {
      throw new ErrorResponse(404, "ContentSubmission not found");
    }

    if (isAdmin) {
      return saveSubmissionVersionForAdmin({ user, submissionId, payload, checks });
    } else if (isReviewer) {
      return saveSubmissionVersionForReviewer({ user, submissionId, payload, checks });
    } else {
      return saveSubmissionVersionForUser({ user, submissionId, payload, checks });
    }
  }

  async function saveSubmissionVersionForAdmin({ user, submissionId, payload }) {
    return createSubmissionVersionRow({ user, submissionId, payload, uploaderUsrType: USER_ROLE.ADMIN });
  }

  async function saveSubmissionVersionForReviewer({ user, submissionId, payload, checks }) {
    if (!checks.isAssignedReviewer) {
      throw new ErrorResponse(403, "Not authorized to upload a version for this submission");
    }

    return createSubmissionVersionRow({ user, submissionId, payload, uploaderUsrType: USER_ROLE.REVIEWER });
  }

  async function saveSubmissionVersionForUser({ user, submissionId, payload, checks }) {
    if (!checks.isOwner) {
      throw new ErrorResponse(403, "Not authorized to upload a version for this submission");
    }

    return createSubmissionVersionRow({ user, submissionId, payload, uploaderUsrType: USER_ROLE.USER });
  }

  async function createSubmissionVersionRow({ user, submissionId, payload, uploaderUsrType }) {
    const { contentFilePath, message } = payload;
    const contentFileId = await fileService.getFileIdByPath(contentFilePath, { fieldName: "contentFilePath" });

    return sequelize.transaction(async (t) => {
      const [row] = await sequelize.query(
        `
          SELECT COALESCE(MAX(CSV.version_no), 0) + 1 AS "nextVersionNo"
          FROM episteme.content_submission_version CSV
          WHERE CSV.content_submission_id = :submissionId
        `,
        {
          type: QueryTypes.SELECT,
          replacements: { submissionId: Number(submissionId) },
          transaction: t,
        }
      );

      const nextVersionNo = Number(row?.nextVersionNo || CONTENT_SUBMISSION_VERSION_INITIAL);

      const version = await ContentSubmissionVersion.create(
        {
          contentSubmissionId: Number(submissionId),
          uploaderUsrId: Number(user.id),
          uploaderUsrType,
          fileId: contentFileId,
          versionNo: nextVersionNo,
          changeLog: message ?? null,
        },
        { transaction: t }
      );

      if ([USER_ROLE.USER, USER_ROLE.ADMIN].includes(uploaderUsrType)) {
        const submission = await ContentSubmission.findOne({
          where: {
            id: Number(submissionId),
          }
        });

        const updates = {};

        if (uploaderUsrType === USER_ROLE.USER) {
          updates.currentContentSubmissionVersionId = version.id;
          updates.currentStatus = CONTENT_SUBMISSION_STATUS.PENDING_APPROVAL;
        } else if (uploaderUsrType === USER_ROLE.ADMIN) {
          updates.currentStatus = CONTENT_SUBMISSION_STATUS.RETURNED;
        }

        await submission.update(updates, { transaction: t });
      }

      return version;
    });
  }

  return {
    getSubmissionVersionsById,
    saveSubmissionVersion,
  };
}
