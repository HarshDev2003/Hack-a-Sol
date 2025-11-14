import asyncHandler from '../utils/asyncHandler.js';
import { getTransactionSummary, listTransactions } from '../services/transaction.service.js';

export const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await listTransactions({
    ownerId: req.user._id,
    category: req.query.category,
    search: req.query.search
  });

  res.json({
    success: true,
    data: transactions
  });
});

export const getTransactionsSummary = asyncHandler(async (req, res) => {
  const summary = await getTransactionSummary({ ownerId: req.user._id });

  res.json({
    success: true,
    data: summary
  });
});

