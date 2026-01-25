import asyncHandler from "express-async-handler";
import { createRefDataService } from "../services/referenceData.js";

const refDataService = createRefDataService({});

// @desc    Get research topics
// @route   GET /api/v1/reference-data/topics
// @access  Public
export const getTopics = asyncHandler(async (req, res) => {
  const topics = await refDataService.getTopics();

  return res.status(200).json({
    success: true,
    data: topics,
  });
});

// @desc    Get countries
// @route   GET /api/v1/reference-data/countries
// @access  Public
export const getCountries = asyncHandler(async (req, res) => {
  const countries = await refDataService.getCountries();

  return res.status(200).json({
    success: true,
    data: countries,
  });
});
