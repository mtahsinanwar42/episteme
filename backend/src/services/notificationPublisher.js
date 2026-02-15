import { NOTIFICATION_TYPE } from "../utils/constants.js";

export function createNotificationPublisher({ notificationService }) {
  if (!notificationService) {
    throw new Error("createNotificationPublisher requires { notificationService }");
  }

  return {
    publishUserRolesUpdatedNotification(user, { oldRoles, newRoles }) {
      return save(notificationService, {
        usrId: user.id,
        type: NOTIFICATION_TYPE.USER_ROLES_UPDATED,
        title: "Your Roles Have Been Updated",
        message: `Your roles have been updated from [${oldRoles.join(", ")}] to [${newRoles.join(", ")}].`,
      });
    },

    publishSubmissionCreatedToAdminNotification(admins, { user, submissionTitle, submissionId }) {
      return Promise.all(admins.map((admin) =>
        save(notificationService, {
          usrId: admin.id,
          type: NOTIFICATION_TYPE.SUBMISSION_CREATED_TO_ADMIN,
          title: "New Submission Received",
          message: `A new submission "${submissionTitle}" has been submitted by ${user.firstName} ${user.lastName}.`,
          resourceType: "ContentSubmission",
          resourceId: submissionId,
        })
      ));
    },

    publishSubmissionStatusUpdatedNotification(user, { submissionTitle, submissionId, oldStatus, newStatus }) {
      return save(notificationService, {
        usrId: user.id,
        type: NOTIFICATION_TYPE.SUBMISSION_STATUS_UPDATED,
        title: "Submission Status Updated",
        message: `Your submission "${submissionTitle}" status has been updated.`,
        resourceType: "ContentSubmission",
        resourceId: submissionId,
      });
    },

    publishSubmissionMsgCreatedNotification(receivers, { sender, submissionTitle, submissionId }) {
      return Promise.all(receivers.map((receiver) =>
        save(notificationService, {
          usrId: receiver.id,
          type: NOTIFICATION_TYPE.SUBMISSION_MSG_CREATED,
          title: "New Message",
          message: `${sender.firstName} ${sender.lastName} sent a message on submission "${submissionTitle}".`,
          resourceType: "ContentSubmission",
          resourceId: submissionId,
        })
      ));
    },

    publishSubmissionVersionCreatedNotification(receivers, { uploader, submissionTitle, submissionId }) {
      return Promise.all(receivers.map((receiver) =>
        save(notificationService, {
          usrId: receiver.id,
          type: NOTIFICATION_TYPE.SUBMISSION_VERSION_CREATED,
          title: "New Submission Version",
          message: `${uploader.firstName} ${uploader.lastName} uploaded a new version for submission "${submissionTitle}".`,
          resourceType: "ContentSubmission",
          resourceId: submissionId,
        })
      ));
    },

    publishSubmissionReviewCreatedNotification(admins, { reviewer, submissionTitle, submissionId }) {
      return Promise.all(admins.map((admin) =>
        save(notificationService, {
          usrId: admin.id,
          type: NOTIFICATION_TYPE.SUBMISSION_REVIEW_CREATED,
          title: "New Review Submitted",
          message: `${reviewer.firstName} ${reviewer.lastName} submitted a review for "${submissionTitle}".`,
          resourceType: "ContentSubmission",
          resourceId: submissionId,
        })
      ));
    },

    publishReviewAssignmentCreatedNotification(reviewer, { submissionTitle, submissionId }) {
      return save(notificationService, {
        usrId: reviewer.id,
        type: NOTIFICATION_TYPE.REVIEW_ASSIGNMENT_CREATED,
        title: "New Review Assignment",
        message: `You have been assigned to review "${submissionTitle}".`,
        resourceType: "ContentSubmission",
        resourceId: submissionId,
      });
    },

    publishReviewAssignmentStatusUpdatedByAdminNotification(reviewer, { submissionTitle, submissionId }) {
      return save(notificationService, {
        usrId: reviewer.id,
        type: NOTIFICATION_TYPE.REVIEW_ASSIGNMENT_STATUS_UPDATED_BY_ADMIN,
        title: "Review Assignment Updated",
        message: `Your review assignment for "${submissionTitle}" has been updated by an admin.`,
        resourceType: "ContentSubmission",
        resourceId: submissionId,
      });
    },

    publishReviewAssignmentStatusUpdatedByReviewerNotification(admins, { reviewer, submissionTitle, submissionId }) {
      return Promise.all(admins.map((admin) =>
        save(notificationService, {
          usrId: admin.id,
          type: NOTIFICATION_TYPE.REVIEW_ASSIGNMENT_STATUS_UPDATED_BY_REVIEWER,
          title: "Review Assignment Updated",
          message: `${reviewer.firstName} ${reviewer.lastName} updated their assignment status for "${submissionTitle}".`,
          resourceType: "ContentSubmission",
          resourceId: submissionId,
        })
      ));
    },
  };
}

async function save(notificationService, { usrId, type, title, message, resourceType, resourceId }) {
  return notificationService.createNotification({
    usrId,
    type,
    title,
    message,
    resourceType: resourceType || null,
    resourceId: resourceId || null,
  });
}
