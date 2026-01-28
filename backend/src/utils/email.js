import Mailjet from "node-mailjet";
import { MAIL_TYPES } from "./constants.js";

let client;

function getMailjetClient() {
  if (client) {
    return client;
  }

  const publicKey = process.env.MAILJET_API_KEY_PUBLIC;
  const privateKey = process.env.MAILJET_API_KEY_PRIVATE;

  if (!publicKey || !privateKey) {
    throw new Error("MAILJET_API_KEY_PUBLIC and MAILJET_API_KEY_PRIVATE are required");
  }

  client = Mailjet.apiConnect(publicKey, privateKey);

  return client;
}

export async function sendMail(payload) {
  validate(payload);

  const mailjet = getMailjetClient();

  const defaultFromEmail = process.env.MAILJET_FROM_EMAIL;
  const defaultFromName = process.env.MAILJET_FROM_NAME || "Episteme";

  if (!defaultFromEmail) {
    throw new Error("MAILJET_FROM_EMAIL is required");
  }

  const from = {
    Email: payload.from?.email || defaultFromEmail,
    Name: payload.from?.name || defaultFromName,
  };

  const to = normalizeRecipientsForProvider(payload.to);

  const body = {
    Messages: [
      {
        From: from,
        To: to,
        Subject: payload.subject,
        TextPart: payload.text || undefined,
        HTMLPart: payload.html || undefined,
      },
    ],
  };

  const res = await mailjet.post("send", { version: "v3.1" }).request(body);

  return res?.body;
}

export function getMailContents(mailType, metadata) {
  if (!Object.values(MAIL_TYPES).includes(mailType)) {
    throw new Error("Invalid mailType");
  }

  const mailContents = {};

  switch (mailType) {
    case MAIL_TYPES.USER_REGISTER:
      mailContents.subject = "Welcome to Episteme";
      mailContents.html = `<p>Hi ${metadata.firstName}, welcome to <strong>Episteme</strong>!</p>`;
      break;
    case MAIL_TYPES.REVIEWER_REGISTER:
      mailContents.subject = "Welcome to Episteme";
      mailContents.html = `<p>Hi ${metadata.firstName}, welcome to <strong>Episteme</strong>!</p>`;
      break;
  }

  return mailContents;
}

export function formatRecipientsForLog(to) {
  if (!to) {
    return "";
  }

  if (Array.isArray(to)) {
    return to
      .map((x) => (typeof x === "string" ? x : x?.email || ""))
      .filter(Boolean)
      .join(",");
  }

  return typeof to === "string" ? to : to?.email || "";
}

function normalizeRecipientsForProvider(to) {
  const arr = Array.isArray(to) ? to : [to];

  return arr.map((x) => {
    if (typeof x === "string") {
      return { Email: x, Name: "" };
    }

    if (!x?.email) {
      throw new Error("payload.to item must have email");
    }

    return { Email: x.email, Name: x.name || "" };
  });
}

function validate(p) {
  if (!p) {
    throw new Error("sendMail: payload is required");
  }

  if (!p.to) {
    throw new Error("sendMail: payload.to is required");
  }

  if (!p.subject) {
    throw new Error("sendMail: payload.subject is required");
  }

  if (!p.text && !p.html) {
    throw new Error("sendMail: payload.text or payload.html is required");
  }
}
