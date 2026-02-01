import asyncHandler from "express-async-handler";

import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";

import { createFileService } from "../services/file.js";
import { createAuthService } from "../services/auth.js";
import { createEmailPublisher } from "../services/emailPublisher.js";

const { User, File } = initModels(sequelize);

const fileService = createFileService({ File });
const emailPublisher = createEmailPublisher();
const authService = createAuthService({ User, fileService, emailPublisher });

// @desc    Login User & Get Token
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login({
    email: req.body.email,
    password: req.body.password,
  });

  sendTokenResponse(user, token, 200, res);
});

// @desc    Register a New User
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  sendTokenResponse(user, token, 201, res);
});

// @desc    Get Logged In User
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const data = await authService.getMe(req.user);

  return res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Update Logged In User Fields (no email/password)
// @route   PUT /api/v1/auth/me/details
// @access  Private
export const updateMyDetails = asyncHandler(async (req, res) => {
  const user = await authService.updateMyDetails(req.user.id, req.body);

  return res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update Logged In User Password
// @route   PUT /api/v1/auth/me/password
// @access  Private
export const updateMyPassword = asyncHandler(async (req, res) => {
  const { user, token } = await authService.updateMyPassword(req.user.id, {
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword,
  });

  sendTokenResponse(user, token, 200, res);
});

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const resetToken = await authService.forgotPassword({
    email: req.body.email,
  });

  return res.status(200).json({
    success: true,
    data: {
      resetToken,
    },
  });
});

// @desc    Reset Password
// @route   PUT /api/v1/auth/resetPassword/:resetToken
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { user, token } = await authService.resetPassword({
    resetToken: req.params.resetToken,
    password: req.body.password,
  });

  sendTokenResponse(user, token, 200, res);
});

// @desc    Logout User
// @route   GET /api/v1/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

function sendTokenResponse(user, token, statusCode, res) {
  const options = {
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
}
