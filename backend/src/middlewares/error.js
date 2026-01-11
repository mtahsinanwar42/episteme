import ErrorResponse from "../utils/ErrorResponse.js";

export const notFound = (req, res, next) => {
  next(new ErrorResponse(404, `Not Found - ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message || 'Internal Server Error';
  error.statusCode = error.statusCode || 500;

  console.log(error);

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};