import ErrorResponse from "../utils/ErrorResponse.js";
import { isEmpty } from "../utils/string.js";

export function createSupportService({ emailPublisher }) {
  if (!emailPublisher) {
    throw new Error("createSupportService requires { emailPublisher }");
  }

  async function publishContactSupportMail(payload) {
    const { name, email, subject, message } = payload;

    if (isEmpty(name) || isEmpty(email) || isEmpty(subject) || isEmpty(message)) {
      return new ErrorResponse(400, "name, email, subject and message fields are required");
    }

    const support = {
      firstName: "Episteme",
      lastName: "Support",
      email: process.env.MAIL_SUPPORT_ADDRESS,
    };

    await emailPublisher.publishContactSupportMail(support, {
      name,
      email,
      subject,
      message,
    });
  }

  return {
    publishContactSupportMail,
  };
}
