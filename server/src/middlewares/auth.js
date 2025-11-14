import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Authentication token missing'));
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    const user = await User.findById(payload.sub).lean();

    if (!user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'User not found'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token'));
  }
};

