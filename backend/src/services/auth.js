import jwt from "jsonwebtoken";
import { Op } from "sequelize";

import ErrorResponse from "../utils/ErrorResponse.js";
import { createEventEnvelope } from "../utils/kafka.js";
import { publishEvent } from "../config/kafka.js";
import { generateUUID } from "../utils/uuid.js";
import { KAFKA_EVENT_TYPES, KAFKA_TOPICS, MAIL_TYPES } from "../utils/constants.js";
import { generateHash } from "../utils/hashing.js";
import { USER_ROLE, USER_STATUS } from "../utils/constants.js";
import { isEmpty, isNotEmpty } from "../utils/string.js";
import { serializeUser } from "../utils/serializers.js";
import { getMailContents } from "../utils/email.js";

export function createAuthService({ User, fileService }) {
  if (!User) {
    throw new Error("createAuthService requires { User } model");
  }

  if (!fileService) {
    throw new Error("createAuthService requires { fileService }");
  }

  function normalizeRoles(roles) {
    return Array.isArray(roles) && roles.length ? roles.map((r) => String(r).toUpperCase()) : ["USER"];
  }

  function determineStatus(normalizedRoles) {
    return normalizedRoles.includes(USER_ROLE.REVIEWER) ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE;
  }

  function buildJwtToken(user) {
    if (typeof user.getGeneratedToken === "function") {
      return user.getGeneratedToken();
    }

    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "15m",
    });
  }

  async function login({ email, password }) {
    if (!email || !password) {
      throw new ErrorResponse(400, "Please provide an email and password");
    }

    const user = await User.findOne({ where: { email, status: USER_STATUS.ACTIVE } });
    if (!user || !(await user.matchPassword(password))) {
      throw new ErrorResponse(401, "Invalid Email or Password!");
    }

    const token = buildJwtToken(user);
    return { user, token };
  }

  async function register(payload) {
    const { email, password, roles, firstName, lastName, phone,
      country, institution, occupation, linkedinUrl } = payload;

    if (isEmpty(email) || isEmpty(password)) {
      throw new ErrorResponse(400, "Please provide an email and password");
    }

    if (await User.findOne({ where: { email } })) {
      throw new ErrorResponse(400, "Email already in use");
    }

    if (isEmpty(firstName) || isEmpty(lastName) || isEmpty(institution) || isEmpty(occupation) || isEmpty(country)) {
      throw new ErrorResponse(400, "Please provide firstName, lastName, institution, occupation, and country");
    }

    const normalizedRoles = normalizeRoles(roles);

    if (normalizedRoles.includes(USER_ROLE.ADMIN)) {
      throw new ErrorResponse(401, "Invalid Role!");
    }

    const status = determineStatus(normalizedRoles);

    const [user] = await User.bulkCreate([{
      email,
      password,
      roles: normalizedRoles,
      status,
      firstName,
      lastName,
      institution,
      occupation,
      country,
      phone,
      linkedinUrl,
    }], { individualHooks: true, returning: true });

    await publishRegistrationEmail(user);

    const token = buildJwtToken(user);

    return { user: serializeUser(user), token };
  }

  async function getMe(user) {
    let cvFilePath = null;
    let photoFilePath = null;

    if (user.cvFileId) {
      cvFilePath = await fileService.getFilePathById(user.cvFileId);
    }

    if (user.photoFileId) {
      photoFilePath = await fileService.getFilePathById(user.photoFileId);
    }

    return serializeUser(user, cvFilePath, photoFilePath);
  }

  async function updateMyDetails(userId, payload) {
    const { firstName, lastName, phone, institution, occupation, country,
      linkedinUrl, photoFilePath, cvFilePath } = payload;

    const updates = {};

    if (isNotEmpty(firstName)) {
      updates.firstName = firstName;
    }

    if (isNotEmpty(lastName)) {
      updates.lastName = lastName;
    }

    if (isNotEmpty(phone)) {
      updates.phone = phone;
    }

    if (isNotEmpty(country)) {
      updates.country = country;
    }

    if (isNotEmpty(institution)) {
      updates.institution = institution;
    }

    if (isNotEmpty(occupation)) {
      updates.occupation = occupation;
    }

    if (isNotEmpty(linkedinUrl)) {
      updates.linkedinUrl = linkedinUrl;
    }

    if (isNotEmpty(photoFilePath)) {
      updates.photoFileId = await fileService.getFileIdByPath(photoFilePath, {
        fieldName: "photoFilePath",
      });
    }

    if (isNotEmpty(cvFilePath)) {
      updates.cvFileId = await fileService.getFileIdByPath(cvFilePath, {
        fieldName: "cvFilePath",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new ErrorResponse(404, "User not found");
    }

    await user.update(updates);

    return serializeUser(user, cvFilePath, photoFilePath);
  }

  async function updateMyPassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      throw new ErrorResponse(400, "Please provide your current password and the new password");
    }

    const user = await User.findByPk(userId);

    if (!user) {
      throw new ErrorResponse(404, "User not found");
    }

    if (!(await user.matchPassword(currentPassword))) {
      throw new ErrorResponse(400, "Password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    const token = buildJwtToken(user);
    return { user, token };
  }

  async function forgotPassword({ email, protocol, host }) {
    if (!email) throw new ErrorResponse(400, "Please provide your email");

    const user = await User.findOne({ where: { email } });
    if (!user) throw new ErrorResponse(404, `User with email ${email} not found`);

    const resetToken = user.prepareResetPasswordToken();
    await user.save();

    const resetUrl = `${protocol}://${host}/api/v1/auth/resetPassword/${resetToken}`;

    // TODO: change to mail service
    return resetUrl;

    /*
    const message =
      "You are receiving this email because you (or someone else) have requested the reset of password. " +
      `Please make a PUT request to:\n\n${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Token",
        message,
      });

      return true;
    } catch (err) {
      console.error(err);

      await user.update({
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
      });

      throw new ErrorResponse(500, "Email could not be sent");
    }
    */
  }

  async function resetPassword({ resetToken, password }) {
    if (!password) {
      throw new ErrorResponse(400, "Please provide a password");
    }

    const resetPasswordToken = generateHash(resetToken);

    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      throw new ErrorResponse(400, "Invalid Token");
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    const token = buildJwtToken(user);
    return { user, token };
  }

  async function publishRegistrationEmail(user) {
    const correlationId = generateUUID();

    const emailMetadata = getMailContents(MAIL_TYPES.USER_REGISTER, user);
    const emailEnvelope = createEventEnvelope({
      type: KAFKA_EVENT_TYPES.EMAIL_SEND,
      version: 1,
      correlationId,
      actor: { system: true, userId: user.id },
      payload: {
        to: { email: user.email, name: `${user.firstName} ${user.lastName}` },
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
      },
    });
  }

  return {
    login,
    register,
    getMe,
    updateMyDetails,
    updateMyPassword,
    forgotPassword,
    resetPassword,
  };
}
