import ApiError from '../utils/ApiError.js';
import Transaction from '../models/Transaction.js';
import { geminiService } from './ai/index.js';

export const detectTransactionAnomalies = async ({ ownerId }) => {
  if (!geminiService.isEnabled()) {
    throw new ApiError(500, 'Gemini AI is not configured for anomaly detection.');
  }

  const transactions = await Transaction.find({ owner: ownerId })
    .sort({ date: -1 })
    .limit(50)
    .lean();

  if (!transactions.length) {
    return [];
  }

  const payload = transactions.map((trx) => ({
    transactionId: trx._id.toString(),
    merchant: trx.merchant,
    category: trx.category,
    amount: trx.amount,
    date: trx.date,
    type: trx.type
  }));

  return geminiService.detectAnomalies(payload);
};

