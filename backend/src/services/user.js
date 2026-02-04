import ErrorResponse from "../utils/ErrorResponse.js";
import { USER_ROLE, USER_STATUS } from "../utils/constants.js";
import { serializeUser } from "../utils/serializers.js";
import { isEmpty, isNotEmpty, isValidEmail, isValidPhone } from "../utils/string.js";

export function createUserService({ User, fileService, emailPublisher }) {
  if (!User) {
    throw new Error("createUserService requires { User } model");
  }

  if (!fileService) {
    throw new Error("createUserService requires { fileService }");
  }

  if (!emailPublisher) {
    throw new Error("createUserService requires { emailPublisher }");
  }

  function normalizeRoles(roles) {
    return Array.isArray(roles) && roles.length ? roles.map((r) => String(r).toUpperCase()) : ["USER"];
  }

  async function getUserById(id) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new ErrorResponse(404, "User not found");
    }

    const cvFilePath = await fileService.getFilePathById(user.cvFileId);
    const photoFilePath = await fileService.getFilePathById(user.photoFileId);

    return serializeUser(user, cvFilePath, photoFilePath);
  }

  async function createUser(payload) {
    const { email, password, roles, firstName, lastName, phone,
      institution, occupation, country, cvFilePath, photoFilePath, linkedinUrl, status } = payload;

    if (isEmpty(email) || isEmpty(password)) {
      throw new ErrorResponse(400, "Please provide an email and password");
    }

    if (await User.findOne({ where: { email } })) {
      throw new ErrorResponse(400, "Email already in use");
    }

    if (isEmpty(firstName) || isEmpty(lastName) || isEmpty(institution) || isEmpty(occupation) || isEmpty(country)) {
      throw new ErrorResponse(400, "Please provide firstName, lastName, institution, occupation, and country");
    }

    if (!Object.values(USER_STATUS).includes(status)) {
      throw new ErrorResponse(400, "Invalid user status");
    }

    if (!isValidEmail(email)) {
      throw new ErrorResponse(400, "Invalid Email!");
    }

    if (isNotEmpty(phone) && !isValidPhone(phone)) {
      throw new ErrorResponse(400, "Invalid phone number format. Use digits, spaces or dashes, optionally starting with +.");
    }

    const normalizedRoles = normalizeRoles(roles);
    const allowedCombo = new Set([USER_ROLE.USER, USER_ROLE.REVIEWER]);

    if (normalizedRoles.length > 1 && !normalizedRoles.every((r) => allowedCombo.has(r))) {
      throw new ErrorResponse(400, "Invalid combination of roles. You can only combine USER and REVIEWER roles.");
    }

    let cvFileId = null;
    let photoFileId = null;

    if (isNotEmpty(cvFilePath)) {
      cvFileId = await fileService.getFileIdByPath(cvFilePath, { fieldName: "cvFilePath" });
    }

    if (isNotEmpty(photoFilePath)) {
      photoFileId = await fileService.getFileIdByPath(photoFilePath, { fieldName: "photoFilePath" });
    }

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
      cvFileId,
      photoFileId,
      linkedinUrl,
    }], { individualHooks: true, returning: true });

    await publishUserCreateEmail(user);

    return serializeUser(user, cvFilePath, photoFilePath);
  }

  async function updateUserById(id, payload) {
    const { firstName, lastName, phone, institution, occupation, country,
      linkedinUrl, photoFilePath, cvFilePath, roles, status, statusUpdateNotes, } = payload;

    const updates = {};

    if (isNotEmpty(firstName)) {
      updates.firstName = firstName;
    }

    if (isNotEmpty(lastName)) {
      updates.lastName = lastName;
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

    if (isNotEmpty(phone)) {
      updates.phone = phone;

      if (!isValidPhone(phone)) {
        throw new ErrorResponse(400, "Invalid phone number format. Use digits, spaces or dashes, optionally starting with +.");
      }
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

    if (roles && Array.isArray(roles) && roles.length > 0) {
      const normalizedRoles = normalizeRoles(roles);
      const allowedCombo = new Set([USER_ROLE.USER, USER_ROLE.REVIEWER]);

      if (normalizedRoles.length > 1 && !normalizedRoles.every((r) => allowedCombo.has(r))) {
        throw new ErrorResponse(400, "Invalid combination of roles. You can only combine USER and REVIEWER roles.");
      }

      updates.roles = normalizedRoles;
    }

    if (Number.isInteger(status)) {
      if (!Object.values(USER_STATUS).includes(status)) {
        throw new ErrorResponse(400, "Invalid user status");
      }

      updates.status = status;

      if (isNotEmpty(statusUpdateNotes)) {
        updates.statusUpdateNotes = statusUpdateNotes;
      }
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw new ErrorResponse(404, "User not found");
    }

    const oldRoles = user.roles;
    const oldStatus = user.status;

    if (user.status === USER_STATUS.DELETED) {
      throw new ErrorResponse(400, "Cannot update deleted user");
    }

    await user.update(updates);

    const rolesChanged = Array.isArray(updates.roles)
      && (JSON.stringify([...(oldRoles ?? [])].map(String).sort())
        !== JSON.stringify([...(updates.roles ?? [])].map(String).sort()));

    if (rolesChanged) {
      await publishUserRolesUpdateEmail(user, {
        oldRoles,
        newRoles: updates.roles,
      });
    }

    const statusChanged = Number.isInteger(updates.status) && updates.status !== oldStatus;

    if (statusChanged) {
      await publishUserStatusUpdateEmail(user, {
        oldStatus,
        newStatus: updates.status,
        statusUpdateNotes: updates.statusUpdateNotes ?? null,
      });
    }

    return serializeUser(user, cvFilePath, photoFilePath);
  }

  async function updateUserStatusById(id, payload) {
    const { status, statusUpdateNotes, } = payload;
    const updates = {};

    if (!Object.values(USER_STATUS).includes(status)) {
      throw new ErrorResponse(400, "Invalid user status");
    }

    updates.status = status;

    if (isNotEmpty(statusUpdateNotes)) {
      updates.statusUpdateNotes = statusUpdateNotes;
    }

    const user = await User.findByPk(id);

    if (!user) {
      throw new ErrorResponse(404, "User not found");
    }

    if (user.status === USER_STATUS.DELETED) {
      throw new ErrorResponse(400, "Cannot update deleted user");
    }

    const oldStatus = user.status;

    await user.update(updates);

    const statusChanged = Number.isInteger(updates.status) && updates.status !== oldStatus;

    if (statusChanged) {
      await publishUserStatusUpdateEmail(user, {
        oldStatus,
        newStatus: updates.status,
        statusUpdateNotes: updates.statusUpdateNotes ?? null,
      });
    }

    return serializeUser(user);
  }

  async function publishUserCreateEmail(user) {
    const loginUrl = `${process.env.FRONTEND_BASE_URL}/login`;

    emailPublisher.publishUserCreateEmail(user, { loginUrl });
  }

  async function publishUserRolesUpdateEmail(user, { oldRoles, newRoles }) {
    const loginUrl = `${process.env.FRONTEND_BASE_URL}/login`;
    const supportMail = process.env.MAIL_SUPPORT_ADDRESS;

    emailPublisher.publishUserRolesUpdateEmail(user, { oldRoles, newRoles, loginUrl, supportMail });
  }

  async function publishUserStatusUpdateEmail(user, { oldStatus, newStatus, statusUpdateNotes }) {
    const loginUrl = `${process.env.FRONTEND_BASE_URL}/login`;
    const supportMail = process.env.MAIL_SUPPORT_ADDRESS;

    emailPublisher.publishUserStatusUpdateEmail(user, { oldStatus, newStatus, statusUpdateNotes, loginUrl, supportMail });
  }

  return {
    getUserById,
    createUser,
    updateUserById,
    updateUserStatusById,
  };
}
