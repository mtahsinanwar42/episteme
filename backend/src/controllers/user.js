import asyncHandler from "express-async-handler";

import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { createFileService } from "../services/file.js";
import { createUserService } from "../services/user.js";

const { User, File } = initModels(sequelize);
const fileService = createFileService({ File });
const userService = createUserService({ User, fileService });

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private
export const getUsers = asyncHandler(async (req, res) => {
  return res.status(200).json(res.advancedResults);
});

// @desc    Get user by id
// @route   GET /api/v1/users/:id
// @access  Private
export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  return res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private
export const saveUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);

  return res.status(201).json({
    success: true,
    data: user,
  });
});

// @desc    Update user by id
// @route   PUT /api/v1/users/:id
// @access  Private
export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUserById(req.params.id, req.body);

  return res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user status (activate/deactivate)
// @route   PUT /api/v1/users/:id/status
// @access  Private
export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.updateUserStatusById(req.params.id, req.body);

  return res.status(200).json({
    success: true,
    data: user,
  });
});
