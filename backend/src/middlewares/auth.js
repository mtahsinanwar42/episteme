import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { initModels } from "../models/index.js";
import { sequelize } from "../config/db.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { USER_STATUS } from "../utils/constants.js";

const { User } = initModels(sequelize);

export const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse(401, "Not Authorized, No Token"));
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decodedToken.id);

    if (!user) {
      return next(new ErrorResponse(401, "Not Authorized, User Not Found"));
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      return next(new ErrorResponse(403, `User account is not active, status: ${user.status} , roles: ${user.roles}`));
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    next(new ErrorResponse(401, "Not Authorized, Token Failed"));
  }
});

export const authorize = (...roles) =>
  asyncHandler(async (req, res, next) => {
    const userRoles = req.user.roles || [];
    const isAllowed = userRoles.some((r) => roles.includes(r));

    if (!isAllowed) {
      return next(
        new ErrorResponse(
          403,
          `User roles [${userRoles.join(", ")}] are not authorized to access this route`
        )
      );
    }

    next();
  });
