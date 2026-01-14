import asyncHandler from "express-async-handler";

import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { createFileService } from "../services/file.js";
import { createBlogService } from "../services/blog.js";

const { Blog, File } = initModels(sequelize);
const fileService = createFileService({ File });
const blogService = createBlogService({ Blog, fileService });

// @desc    Get all blogs
// @route   GET /api/v1/blogs
// @access  Private
export const getBlogs = asyncHandler(async (req, res) => {
  return res.status(200).json(res.advancedResults);
});

// @desc    Get blog by id
// @route   GET /api/v1/blogs/:id
// @access  Private
export const getBlog = asyncHandler(async (req, res) => {
  const blog = await blogService.getBlogById(req.params.id);

  return res.status(200).json({
    success: true,
    data: blog,
  });
});

// @desc    Create blog
// @route   POST /api/v1/blogs
// @access  Private
export const saveBlog = asyncHandler(async (req, res) => {
  const blog = await blogService.createBlog(req.body);

  return res.status(201).json({
    success: true,
    data: blog,
  });
});

// @desc    Update blog by id
// @route   PUT /api/v1/blogs/:id
// @access  Private
export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await blogService.updateBlogById(req.params.id, req.body);

  return res.status(200).json({
    success: true,
    data: blog,
  });
});
