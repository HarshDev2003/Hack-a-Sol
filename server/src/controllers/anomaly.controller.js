import asyncHandler from '../utils/asyncHandler.js';
import { detectTransactionAnomalies } from '../services/anomaly.service.js';

export const getAnomalies = asyncHandler(async (req, res) => {
  const anomalies = await detectTransactionAnomalies({ ownerId: req.user._id });
  res.json({
    success: true,
    data: anomalies
  });
});

