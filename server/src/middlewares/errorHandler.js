import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    logger.error({ err, reqId: req.id }, message);
  } else {
    logger.warn({ err, reqId: req.id }, message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

