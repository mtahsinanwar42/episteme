import bcrypt from "bcryptjs";
import ErrorResponse from "../utils/ErrorResponse.js";
import { USER_ROLE, USER_STATUS } from "../utils/constants.js";
import { serializeUser } from "../utils/serializers.js";
import { isEmpty, isNotEmpty } from "../utils/string.js";

export function createUserService({ User, fileService }) {
  if (!User) {
    throw new Error("createUserService requires { User } model");
  }

  if (!fileService) {
    throw new Error("createAuthService requires { fileService }");
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
    const { email, password, roles, firstName, lastName, phone, cvFilePath, photoFilePath, linkedinUrl } =
      payload;

    if (isEmpty(email) || isEmpty(password)) {
      throw new ErrorResponse(400, "Please provide an email and password");
    }

    if (await User.findOne({ where: { email } })) {
      throw new ErrorResponse(400, "Email already in use");
    }

    if (isEmpty(firstName) || isEmpty(lastName)) {
      throw new ErrorResponse(400, "Please provide firstName and lastName");
    }

    const normalizedRoles = normalizeRoles(roles);

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
      status: payload.status,
      firstName,
      lastName,
      phone,
      cvFileId,
      photoFileId,
      linkedinUrl,
    }], { individualHooks: true, returning: true });

    return serializeUser(user, cvFilePath, photoFilePath);
  }

  async function updateUserById(id, payload) {
    const { firstName, lastName, phone, linkedinUrl, photoFilePath, cvFilePath, roles } = payload;

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
      updates.roles = normalizeRoles(roles);
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw new ErrorResponse(404, "User not found");
    }

    await user.update(updates);

    return serializeUser(user, cvFilePath, photoFilePath);
  }

  async function toggleUserStatusById(id, status) {
    if (![USER_STATUS.INACTIVE, USER_STATUS.ACTIVE, USER_STATUS.SUSPENDED, USER_STATUS.DELETED].includes(status)) {
      throw new ErrorResponse(400, "Invalid user status");
    }

    const user = await User.findByPk(id);

    if (!user) {
      throw new ErrorResponse(404, "User not found");
    }

    await user.update({ status });

    return serializeUser(user)
  }

  return {
    getUserById,
    createUser,
    updateUserById,
    toggleUserStatusById,
  };
}
