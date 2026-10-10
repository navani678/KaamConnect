import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let fields = err.fields || null;

  // Handle Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const fieldName = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `${fieldName} already exists`;
    fields = { [fieldName]: `${fieldName} is already in use` };
  }

  // Handle Mongoose validation error
  if (err.name === 'ValidationError' && !fields) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    fields = {};
    Object.keys(err.errors).forEach((key) => {
      fields[key] = err.errors[key].message;
    });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ${err.path}: ${err.value}`;
    fields = { [err.path]: 'Invalid format/ID' };
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token expired';
  }

  const errorResponse = {
    code,
    message,
    ...(fields && Object.keys(fields).length > 0 ? { fields } : {})
  };

  if (env.NODE_ENV === 'development' && statusCode === 500) {
    errorResponse.stack = err.stack;
  }

  return res.status(statusCode).json({
    success: false,
    error: errorResponse
  });
};

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, 'NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`));
};
