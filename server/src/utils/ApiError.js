import httpStatus from 'http-status';

class ApiError extends Error {
  constructor(statusCode = httpStatus.INTERNAL_SERVER_ERROR, message = 'Something went wrong', errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;

