import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';
import { registerUser, authenticateUser } from '../services/auth.service.js';
import User from '../models/User.js';

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    data: user
  });
});

export const login = asyncHandler(async (req, res) => {
  const { token, user } = await authenticateUser(req.body);
  res.json({
    success: true,
    data: {
      token,
      user
    }
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  res.json({
    success: true,
    data: user
  });
});

