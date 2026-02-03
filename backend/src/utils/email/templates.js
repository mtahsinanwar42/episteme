import { CONTENT_SUBMISSION_STATUS, getFormattedEnumLabel, MAIL_TYPES, REVIEW_ASSIGNMENT_STATUS, REVIEW_RECOMMENDATION, USER_STATUS } from "../constants.js";
import { p, a, button, small, badge, emailLayout, esc } from "./formatters.js";

export function getMailContents(mailType, metadata = {}) {
  if (!Object.values(MAIL_TYPES).includes(mailType)) {
    throw new Error("Invalid mailType");
  }
  const footerHtml = `
  <div style="margin-top:2px;">— Episteme Team</div>
  `;
  const MAIL_DEFS = {
    [MAIL_TYPES.USER_REGISTER]: (m) => {
      const loginUrl = m.loginUrl;

      return {
        subject: "Welcome to Episteme 🎉",
        html: emailLayout({
          greetingName: m.firstName,
          title: "Welcome to Episteme",
          bodyHtml: [
            p(`Your account is ready. You can now submit to conferences, track reviews, and manage your profile.`),
            button(loginUrl, "Log in to Episteme"),
            small(`If the button doesn’t work, copy and paste this link into your browser: ${a(loginUrl, loginUrl)}`),
          ].join(""),
          footerHtml,
        }),
      };
    },

    [MAIL_TYPES.REVIEWER_REGISTER]: (m) => {
      const loginUrl = m.loginUrl;

      return {
        subject: "Reviewer registration received — Episteme",
        html: emailLayout({
          greetingName: m.firstName,
          title: "Thanks for signing up as a reviewer",
          bodyHtml: [
            `<div style="margin:0 0 12px 0;">${badge("Pending editor review")}</div>`,
            p(
              `We’ve received your reviewer registration. Our editors will review your details and activate your reviewer access.`
            ),
            p(
              `Once your account has been activated, you’ll receive another email from us.`
            ),
            small(`After activation, you can log in here: ${a(loginUrl, "Log in to Episteme")}`),
          ].join(""),
          footerHtml,
        }),
      };
    },

    [MAIL_TYPES.PASSWORD_UPDATED]: (m) => {
      const loginUrl = m.loginUrl;

      return {
        subject: "Your Episteme password has been updated 🔐",
        html: emailLayout({
          greetingName: m.firstName,
          title: "Password updated successfully",
          bodyHtml: [
            p(`This is a confirmation that your Episteme account password was changed successfully.`),
            button(loginUrl, "Log in to Episteme"),
            small(
              `If the button doesn’t work, copy and paste this link into your browser: ${a(loginUrl, loginUrl)}`
            ),
          ].join(""),
          footerHtml,
        }),
      };
    },

    [MAIL_TYPES.PASSWORD_RESET_REQUEST]: (m) => {
      const resetPasswordUrl = m.resetPasswordUrl;
      const expiresInMinutes = m.expiresInMinutes ?? 10;
      const supportMail = m.supportMail;

      return {
        subject: "Reset your Episteme password",
        html: emailLayout({
          greetingName: m.firstName,
          title: "Password reset requested",
          bodyHtml: [
            p("We received a request to reset the password for your Episteme account."),
            p(`Please reset your password using the link below (valid for ${expiresInMinutes} minutes):`),
            p(a(resetPasswordUrl, resetPasswordUrl)),
            p("If you did not request this password reset, you can safely ignore this email."),
            p(`For any concerns, please contact our support at ${supportMail}.`),
          ].join(""),
          footerHtml,
        }),
      };
    },

    [MAIL_TYPES.USER_CREATED]: (m) => {
      const loginUrl = m.loginUrl;
      const username = m.email;
      const password = m.password;
      const normalizedRoles = m.roles.join(", ");
      const status = getFormattedEnumLabel(USER_STATUS, m.status);

      return {
        subject: "Your Episteme account has been created",
        html: emailLayout({
          greetingName: m.firstName,
          title: "Account created",
          bodyHtml: [
            p("An Episteme administrator has created an account for you."),
            p(`<strong>Username:</strong> ${esc(username)}`),
            p(`<strong>Password:</strong> ${esc(password)}`),
            p(`<strong>Status:</strong> ${esc(status)}`),
            p(`You have given ${normalizedRoles} access. You can log in here: ${a(loginUrl, "Log in to Episteme")}`),
            p("After logging in, please change your password from your profile settings."),
          ].join(""),
          footerHtml,
        }),
      };
    },

    [MAIL_TYPES.USER_ROLES_UPDATED]: (m) => {
      const loginUrl = m.loginUrl;
      const normalizedOldRoles = m.oldRoles.join(", ");
      const normalizedNewRoles = m.newRoles.join(", ");

      return {
        subject: "Your Episteme roles were updated",
        html: emailLayout({
          greetingName: m.firstName,
          title: "Roles updated",
          bodyHtml: [
            p("An Episteme administrator has updated your roles."),

            p(`<strong>Previous roles:</strong> ${esc(normalizedOldRoles)}`),
            p(`<strong>New roles:</strong> ${esc(normalizedNewRoles)}`),

            p(`Log in here: ${a(loginUrl, "Log in to Episteme")}`),
            p(`If you have questions, contact support at ${esc(m.supportMail)}.`),
          ].join(""),
          footerHtml,
        }),
      };
    },

    [MAIL_TYPES.USER_STATUS_UPDATED]: (m) => {
      const loginUrl = m.loginUrl;
      const oldStatus = getFormattedEnumLabel(USER_STATUS, m.oldStatus);
      const newStatus = getFormattedEnumLabel(USER_STATUS, m.newStatus);
      const isNowActive = m.newStatus === USER_STATUS.ACTIVE;

      return {
        subject: "Your Episteme account status was updated",
        html: emailLayout({
          greetingName: m.firstName,
          title: "Account status updated",
          bodyHtml: [
            p("An Episteme administrator has updated your account status."),
            p(`<strong>Previous status:</strong> ${esc(oldStatus)}`),
            p(`<strong>New status:</strong> ${esc(newStatus)}`),
            m.statusUpdateNotes ? p(`<strong>Notes:</strong> ${esc(m.statusUpdateNotes)}`) : "",
            isNowActive ? p(`You can log in here: ${a(loginUrl, "Log in to Episteme")}`) : "",
            p(`For further information, please contact support at ${esc(m.supportMail)}.`),
          ].join(""),
          footerHtml,
        }),
      };
    },

    [MAIL_TYPES.SUBMISSION_CREATED_TO_USER]: (m) => {
      return {
        subject: `Submission received: ${esc(m.submissionTitle)}`,
        html: emailLayout({
          greetingName: m.firstName,
          title: "Your submission was received",
          bodyHtml: [
            p(`Your submission has been submitted successfully.`),

            p(`<strong>Submission:</strong> ${esc(m.submissionTitle)}`),

            m.submissionUrl
              ? p(`You can track your submission here: ${a(m.submissionUrl, "View submission")}`)
              : "",

            p(`Our editors and reviewers will review your submission carefully.`),
          ].filter(Boolean).join(""),
          footerHtml,
        }),
      };
    },

    [MAIL_TYPES.SUBMISSION_CREATED_TO_ADMIN]: (m) => {
      return {
        subject: `New Submission Received: ${esc(m.submissionTitle)}`,
        html: emailLayout({
          greetingName: "Editor",
          title: "A new submission has been received",
          bodyHtml: [
            p(`<strong>Submission:</strong> ${esc(m.submissionTitle)}`),
            p(`<strong>Submitted By:</strong> ${esc(m.firstName)} ${esc(m.lastName)}, ${esc(m.email)}`),
            p(`Open submission: ${a(m.submissionUrl, "View submission")}`),
            p("Please review the submission and assign reviewers as required."),
          ].filter(Boolean).join(""),
          footerHtml,
        }),
      };
    },

    [MAIL_TYPES.SUBMISSION_STATUS_UPDATED]: (m) => {
      const oldStatus = getFormattedEnumLabel(CONTENT_SUBMISSION_STATUS, m.oldStatus);
      const newStatus = getFormattedEnumLabel(CONTENT_SUBMISSION_STATUS, m.newStatus);

      return {
        subject: `Submission Status Updated: ${esc(m.submissionTitle)}`,
        html: emailLayout({
          greetingName: m.firstName,
          title: "Your submission status was updated",
          bodyHtml: [
            p(`<strong>Submission:</strong> ${esc(m.submissionTitle)}`),
            p(`<strong>Previous Status:</strong> ${esc(oldStatus)}`),
            p(`<strong>New Status:</strong> ${esc(newStatus)}`),
            m.notes ? p(`<strong>Notes:</strong> ${esc(m.notes)}`) : "",
            m.submissionUrl ? p(`Open submission: ${a(m.submissionUrl, "View submission")}`) : "",
          ].filter(Boolean).join(""),
          footerHtml,
        }),
      };
    },

    [MAIL_TYPES.SUBMISSION_MSG_CREATED]: (m) => {
      const from = `${m.sender.firstName}`;
      const to = `${m.receiver.firstName}`;

      return {
        subject: `New message received in submission: ${esc(m.submissionTitle)}`,
        html: emailLayout({
          greetingName: to,
          title: `You have received new message in the submission`,
          bodyHtml: [
            p(`<strong>Submission:</strong> ${esc(m.submissionTitle)}`),
            p(`<strong>Message from ${from}:</strong> ${esc(m.message)}`),
            m.submissionUrl ? p(`Open submission: ${a(m.submissionUrl, "View submission")}`) : "",
          ].filter(Boolean).join(""),
          footerHtml,
        }),
      };
    },

    [MAIL_TYPES.SUBMISSION_VERSION_CREATED]: (m) => {
      return {
        subject: `New Version Created for Submission: ${esc(m.submissionTitle)}`,
        html: emailLayout({
          greetingName: m.receiver.firstName,
          title: "A new version has been uploaded for the submission",
          bodyHtml: [
            p(`<strong>Submission:</strong> ${esc(m.submissionTitle)}`),
            p(
              `<strong>Uploaded By:</strong> ${esc(m.uploader.firstName)} ${esc(m.uploader.lastName)}, ${esc(m.uploader.email)}`
            ),
            m.notes ? p(`<strong>Notes:</strong> ${esc(m.notes)}`) : "",
            p(`Open submission: ${a(m.submissionUrl, "View submission")}`),
          ].filter(Boolean).join(""),
          footerHtml,
        }),
      };
    },

    [MAIL_TYPES.SUBMISSION_REVIEW_CREATED]: (m) => {
      return {
        subject: `New Review Created for Submission: ${esc(m.submissionTitle)}`,
        html: emailLayout({
          greetingName: m.receiver.firstName,
          title: "Reviewer has given review for the submission successfully",
          bodyHtml: [
            p(`<strong>Submission:</strong> ${esc(m.submissionTitle)}`),
            p(
              `<strong>Reviewed By:</strong> ${esc(m.reviewer.firstName)} ${esc(m.reviewer.lastName)}, ${esc(m.reviewer.email)}`
            ),
            p(`<strong>Recommendation:</strong> ${esc(getFormattedEnumLabel(REVIEW_RECOMMENDATION, m.recommendation))}`),
            m.notes ? p(`<strong>Notes:</strong> ${esc(m.notes)}`) : "",
            p(`Open submission: ${a(m.submissionUrl, "View submission")}`),
          ].filter(Boolean).join(""),
          footerHtml,
        }),
      };
    },

    [MAIL_TYPES.REVIEW_ASSIGNMENT_CREATED]: (m) => {
      return {
        subject: `New Review Assignment: ${esc(m.submissionTitle)}`,
        html: emailLayout({
          greetingName: m.reviewer.firstName,
          title: "You have been assigned a new submission to review",
          bodyHtml: [
            p(`<strong>Submission:</strong> ${esc(m.submissionTitle)}`),
            p(
              `<strong>Assigned By:</strong> ${esc(m.assignedBy.firstName)} ${esc(m.assignedBy.lastName)}, ${esc(m.assignedBy.email)}`
            ),
            m.notes ? p(`<strong>Notes:</strong> ${esc(m.notes)}`) : "",
            p(`Open submission: ${a(m.submissionUrl, "View submission")}`),
            p(`If you have questions, contact the assigner.`),
          ].filter(Boolean).join(""),
          footerHtml,
        }),
      };
    },

    [MAIL_TYPES.REVIEW_ASSIGNMENT_STATUS_UPDATED_BY_ADMIN]: (m) => {
      const oldStatus = getFormattedEnumLabel(REVIEW_ASSIGNMENT_STATUS, m.oldStatus);
      const newStatus = getFormattedEnumLabel(REVIEW_ASSIGNMENT_STATUS, m.newStatus);

      return {
        subject: `Review Assignment Status Updated: ${esc(m.submissionTitle)}`,
        html: emailLayout({
          greetingName: m.reviewer.firstName,
          title: "Your review assignment status was updated",
          bodyHtml: [
            p(`<strong>Submission:</strong> ${esc(m.submissionTitle)}`),
            p(`<strong>Updated By:</strong> ${esc(m.assignedBy.firstName)} ${esc(m.assignedBy.lastName)}, ${esc(m.assignedBy.email)}`),
            p(`<strong>Previous Status:</strong> ${esc(oldStatus)}`),
            p(`<strong>New Status:</strong> ${esc(newStatus)}`),
            m.notes ? p(`<strong>Notes:</strong> ${esc(m.notes)}`) : "",
            m.submissionUrl ? p(`Open submission: ${a(m.submissionUrl, "View submission")}`) : "",
          ].filter(Boolean).join(""),
          footerHtml,
        }),
      };
    },

    [MAIL_TYPES.REVIEW_ASSIGNMENT_STATUS_UPDATED_BY_REVIEWER]: (m) => {
      const oldStatus = getFormattedEnumLabel(REVIEW_ASSIGNMENT_STATUS, m.oldStatus);
      const newStatus = getFormattedEnumLabel(REVIEW_ASSIGNMENT_STATUS, m.newStatus);

      return {
        subject: `Review Assignment Updated by Reviewer: ${esc(m.submissionTitle)}`,
        html: emailLayout({
          greetingName: "Editor",
          title: "A reviewer updated the review assignment status",
          bodyHtml: [
            p(`<strong>Submission:</strong> ${esc(m.submissionTitle)}`),
            p(`<strong>Reviewer:</strong> ${esc(m.reviewer.firstName)} ${esc(m.reviewer.lastName)}, ${esc(m.reviewer.email)}`),
            p(`<strong>Previous Status:</strong> ${esc(oldStatus)}`),
            p(`<strong>New Status:</strong> ${esc(newStatus)}`),
            p(`Open submission: ${a(m.submissionUrl, "View submission")}`),
          ].filter(Boolean).join(""),
          footerHtml,
        }),
      };
    },

    [MAIL_TYPES.CONTACT_SUPPORT]: (m) => {
      return {
        subject: `Support request: ${esc(m.subject)}`,
        html: emailLayout({
          greetingName: `${m.receiver.firstName} ${m.receiver.lastName}`,
          title: "New support request received",
          bodyHtml: [
            p(`<strong>From:</strong> ${esc(m.sender.name)} (${esc(m.sender.email)})`),
            p(`<strong>Subject:</strong> ${esc(m.subject)}`),
            `<hr style="border:none;border-top:1px solid #e5e5e5;margin:12px 0;" />`,
            p(`<strong>Message:</strong>`),
            p(esc(m.message)),
            `<hr style="border:none;border-top:1px solid #e5e5e5;margin:12px 0;" />`,
            p(`You can reply directly to this email to contact the sender.`),
          ].join(""),
          footerHtml,
        }),
      };
    },
  };

  const generate = MAIL_DEFS[mailType];
  if (!generate) {
    throw new Error(`No mail template configured for mailType=${mailType}`);
  }

  return generate(metadata);
}

