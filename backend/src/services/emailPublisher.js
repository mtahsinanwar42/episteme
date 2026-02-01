import { generateUUID } from "../utils/uuid.js";
import { createEventEnvelope } from "../utils/kafka.js";
import { publishEvent } from "../config/kafka.js";
import { getMailContents } from "../utils/email/index.js";
import { KAFKA_EVENT_TYPES, KAFKA_TOPICS, MAIL_TYPES } from "../utils/constants.js";

export function createEmailPublisher() {
  return {
    publishUserRegistrationEmail(user, { loginUrl } = {}) {
      return publishEmail({
        actorUserId: user.id,
        to: buildRecipient(user),
        mailType: MAIL_TYPES.USER_REGISTER,
        metadata: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          loginUrl,
        },
      });
    },

    publishReviewerRegistrationEmail(user, { loginUrl } = {}) {
      return publishEmail({
        actorUserId: user.id,
        to: buildRecipient(user),
        mailType: MAIL_TYPES.REVIEWER_REGISTER,
        metadata: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          loginUrl,
        },
      });
    },

    publishPasswordUpdateEmail(user, { loginUrl, supportMail } = {}) {
      return publishEmail({
        actorUserId: user.id,
        to: buildRecipient(user),
        mailType: MAIL_TYPES.PASSWORD_UPDATED,
        metadata: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          loginUrl,
          supportMail,
        },
      });
    },

    publishPasswordResetRequestEmail(user, { resetPasswordUrl, expiresInMinutes, supportMail } = {}) {
      return publishEmail({
        actorUserId: user.id,
        to: buildRecipient(user),
        mailType: MAIL_TYPES.PASSWORD_RESET_REQUEST,
        metadata: {
          firstName: user.firstName,
          email: user.email,
          resetPasswordUrl,
          expiresInMinutes,
          supportMail,
        },
      });
    },

    publishUserCreateEmail(user, { loginUrl }) {
      return publishEmail({
        actorUserId: user.id,
        to: buildRecipient(user),
        mailType: MAIL_TYPES.USER_CREATED,
        metadata: {
          firstName: user.firstName,
          email: user.email,
          password: user.password,
          status: user.status,
          roles: user.roles,
          loginUrl,
        },
      });
    },

    publishUserRolesUpdateEmail(user, { oldRoles, newRoles, loginUrl, supportMail }) {
      return publishEmail({
        actorUserId: user.id,
        to: buildRecipient(user),
        mailType: MAIL_TYPES.USER_ROLES_UPDATED,
        metadata: {
          firstName: user.firstName,
          email: user.email,
          oldRoles,
          newRoles,
          loginUrl,
          supportMail,
        },
      });
    },

    publishUserStatusUpdateEmail(user, { oldStatus, newStatus, statusUpdateNotes, loginUrl, supportMail }) {
      return publishEmail({
        actorUserId: user.id,
        to: buildRecipient(user),
        mailType: MAIL_TYPES.USER_STATUS_UPDATED,
        metadata: {
          firstName: user.firstName,
          email: user.email,
          oldStatus,
          newStatus,
          statusUpdateNotes,
          loginUrl,
          supportMail,
        },
      });
    },

    publishSubmissionCreateToUserEmail(user, {
      submissionTitle,
      submissionUrl,
    }) {
      return publishEmail({
        actorUserId: user.id,
        to: buildRecipient(user),
        mailType: MAIL_TYPES.SUBMISSION_CREATED_TO_USER,
        metadata: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          submissionTitle,
          submissionUrl,
        },
      });
    },

    publishSubmissionCreateToAdminsEmail(admins, {
      user,
      submissionTitle,
      submissionUrl,
    }) {
      return publishEmail({
        to: admins.map(adm => buildRecipient(adm)),
        mailType: MAIL_TYPES.SUBMISSION_CREATED_TO_ADMIN,
        metadata: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          submissionTitle,
          submissionUrl,
        },
      });
    },

    publishSubmissionStatusUpdatedMail(user, {
      oldStatus,
      newStatus,
      notes,
      submissionTitle,
      submissionUrl,
    }) {
      return publishEmail({
        to: buildRecipient(user),
        mailType: MAIL_TYPES.SUBMISSION_STATUS_UPDATED,
        metadata: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          submissionTitle,
          submissionUrl,
          oldStatus,
          newStatus,
          notes,
        },
      });
    },

    publishSubmissionMsgCreateMail(users, {
      sender,
      message,
      submissionTitle,
      submissionUrl,
    }) {
      return publishEmail({
        to: users.map(u => buildRecipient(u)),
        mailType: MAIL_TYPES.SUBMISSION_MSG_CREATED,
        metadata: {
          receiver: {
            firstName: users.length === 1 ? users[0].firstName : "Editor",
          },
          sender: {
            firstName: sender.firstName,
          },
          message,
          submissionTitle,
          submissionUrl,
        },
      });
    },

    publishSubmissionVersionCreateEmail(users, {
      submissionTitle,
      submissionUrl,
      uploader,
      notes,
    }) {
      return publishEmail({
        to: users.map(u => buildRecipient(u)),
        mailType: MAIL_TYPES.SUBMISSION_VERSION_CREATED,
        metadata: {
          submissionTitle,
          submissionUrl,
          receiver: {
            firstName: users.length === 1 ? users[0].firstName : "Editor",
          },
          uploader: {
            firstName: uploader.firstName,
            lastName: uploader.lastName,
            email: uploader.email,
          },
          notes,
        },
      });
    },

    publishSubmissionReviewCreateEmail(admins, {
      submissionTitle,
      submissionUrl,
      reviewer,
      recommendation,
      notes,
    }) {
      return publishEmail({
        to: admins.map(adm => buildRecipient(adm)),
        mailType: MAIL_TYPES.SUBMISSION_REVIEW_CREATED,
        metadata: {
          submissionTitle,
          submissionUrl,
          receiver: {
            firstName: admins.length === 1 ? admins[0].firstName : "Editor",
          },
          reviewer: {
            firstName: reviewer.firstName,
            lastName: reviewer.lastName,
            email: reviewer.email,
          },
          recommendation,
          notes,
        },
      });
    },

    publishReviewAssignmentCreateEmail(reviewer, {
      submissionTitle,
      submissionUrl,
      assignedBy,
      notes,
    }) {
      return publishEmail({
        actorUserId: reviewer.id,
        to: buildRecipient(reviewer),
        mailType: MAIL_TYPES.REVIEW_ASSIGNMENT_CREATED,
        metadata: {
          submissionTitle,
          submissionUrl,
          reviewer: {
            firstName: reviewer.firstName,
            lastName: reviewer.lastName,
            email: reviewer.email,
          },
          assignedBy: {
            firstName: assignedBy.firstName,
            lastName: assignedBy.lastName,
            email: assignedBy.email,
          },
          notes,
        },
      });
    },

    publishReviewAssignmentUpdateStatusByAdminEmail(reviewer, {
      oldStatus,
      newStatus,
      submissionTitle,
      submissionUrl,
      assignedBy,
      notes,
    }) {
      return publishEmail({
        to: buildRecipient(reviewer),
        mailType: MAIL_TYPES.REVIEW_ASSIGNMENT_STATUS_UPDATED_BY_ADMIN,
        metadata: {
          submissionTitle,
          submissionUrl,
          oldStatus,
          newStatus,
          reviewer: {
            firstName: reviewer.firstName,
            lastName: reviewer.lastName,
            email: reviewer.email,
          },
          assignedBy: {
            firstName: assignedBy.firstName,
            lastName: assignedBy.lastName,
            email: assignedBy.email,
          },
          notes,
        },
      });
    },

    publishReviewAssignmentUpdateStatusByReviewerEmail(admins, {
      oldStatus,
      newStatus,
      reviewer,
      submissionTitle,
      submissionUrl,
    }) {
      return publishEmail({
        actorUserId: reviewer.id,
        to: admins.map(adm => buildRecipient(adm)),
        mailType: MAIL_TYPES.REVIEW_ASSIGNMENT_STATUS_UPDATED_BY_REVIEWER,
        metadata: {
          submissionTitle,
          submissionUrl,
          oldStatus,
          newStatus,
          reviewer: {
            firstName: reviewer.firstName,
            lastName: reviewer.lastName,
            email: reviewer.email,
          },
        },
      });
    },
  };
}

async function publishEmail({ actorUserId, to, mailType, metadata }) {
  const correlationId = generateUUID();

  const emailMetadata = getMailContents(mailType, metadata);

  const emailEnvelope = createEventEnvelope({
    type: KAFKA_EVENT_TYPES.EMAIL_SEND,
    version: 1,
    correlationId,
    actor: { system: true, userId: actorUserId ?? null },
    payload: {
      mailType,
      to,
      ...emailMetadata,
    },
  });

  await publishEvent({
    topic: KAFKA_TOPICS.EMAIL_SEND,
    key: emailEnvelope.id,
    value: emailEnvelope,
    headers: {
      "event-type": emailEnvelope.type,
      "correlation-id": correlationId,
      "mail-type": String(mailType),
    },
  });

  return { correlationId, eventId: emailEnvelope.id };
}

function buildRecipient({ email, firstName, lastName }) {
  return { email, name: `${firstName ?? ""} ${lastName ?? ""}`.trim() };
}
