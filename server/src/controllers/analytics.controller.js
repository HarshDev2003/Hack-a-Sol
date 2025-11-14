import asyncHandler from '../utils/asyncHandler.js';
import { getAnalyticsSummary } from '../services/analytics.service.js';

export const getAnalytics = asyncHandler(async (req, res) => {
  const summary = await getAnalyticsSummary({ ownerId: req.user._id });
  res.json({
    success: true,
    data: summary
  });
});

