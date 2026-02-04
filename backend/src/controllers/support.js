import asyncHandler from "express-async-handler";

import { createSupportService } from "../services/support.js";
import { createEmailPublisher } from "../services/emailPublisher.js";

const emailPublisher = createEmailPublisher();
const supportService = createSupportService({ emailPublisher });

// @desc    Create blog
// @route   POST /api/v1/contact-support
// @access  Public
export const contactSupport = asyncHandler(async (req, res) => {
  await supportService.publishContactSupportMail(req.body);

  return res.status(201).json({
    success: true,
  });
});
