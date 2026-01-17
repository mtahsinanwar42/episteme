import ErrorResponse from "../utils/ErrorResponse.js";
import { USER_ROLE, USER_STATUS } from "../utils/constants.js";
import { serializeUser } from "../utils/serializers.js";
import { isEmpty, isNotEmpty } from "../utils/string.js";

export function createUserService({ User, fileService }) {
  if (!User) {
    throw new Error("createUserService requires { User } model");
  }

  if (!fileService) {
    throw new Error("createUserService requires { fileService }");
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

    return serializeUser(user, cvFilePath, photoFilePath);
  }

  async function updateUserById(id, payload) {
    const { firstName, lastName, phone, institution, occupation, country,
      linkedinUrl, photoFilePath, cvFilePath, roles, status } = payload;

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
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw new ErrorResponse(404, "User not found");
    }

    await user.update(updates);

    return serializeUser(user, cvFilePath, photoFilePath);
  }

  async function updateUserStatusById(id, status) {
    if (!Object.values(USER_STATUS).includes(status)) {
      throw new ErrorResponse(400, "Invalid user status");
    }

    const user = await User.findByPk(id);

    if (!user) {
      throw new ErrorResponse(404, "User not found");
    }

    await user.update({ status });

    return serializeUser(user);
  }

  return {
    getUserById,
    createUser,
    updateUserById,
    updateUserStatusById,
  };
}
