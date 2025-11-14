import Transaction from '../models/Transaction.js';
import Document from '../models/Document.js';

const monthsBack = 6;

const buildMonthlyRange = () => {
  const months = [];

  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push({
      label: date.toLocaleString('default', { month: 'short' }),
      year: date.getFullYear(),
      month: date.getMonth()
    });
  }

  return months;
};

export const getAnalyticsSummary = async ({ ownerId }) => {
  const [documentsCount, transactions, categoryStats] = await Promise.all([
    Document.countDocuments({ owner: ownerId }),
    Transaction.find({ owner: ownerId }).sort({ date: -1 }).limit(5),
    Transaction.aggregate([
      { $match: { owner: ownerId } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ])
  ]);

  const totals = transactions.reduce(
    (acc, trx) => {
      acc[trx.type] += trx.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const monthlyRange = buildMonthlyRange();

  const monthlyData = await Transaction.aggregate([
    {
      $match: {
        owner: ownerId,
        date: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - monthsBack))
        }
      }
    },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' }
      }
    }
  ]);

  const monthlyPerformance = monthlyRange.map((bucket) => {
    const matchingIncome = monthlyData.find((entry) => entry._id.year === bucket.year && entry._id.month === bucket.month + 1 && entry._id.type === 'income');
    const matchingExpense = monthlyData.find((entry) => entry._id.year === bucket.year && entry._id.month === bucket.month + 1 && entry._id.type === 'expense');

    return {
      month: bucket.label,
      income: matchingIncome?.total || 0,
      expenses: matchingExpense?.total || 0,
      profit: (matchingIncome?.total || 0) - (matchingExpense?.total || 0)
    };
  });

  const categoryDistribution = categoryStats.map((item) => ({
    name: item._id || 'Uncategorized',
    value: item.total
  }));

  return {
    totals: {
      totalIncome: totals.income,
      totalExpenses: totals.expense,
      documentCount: documentsCount
    },
    monthlyPerformance,
    categoryDistribution,
    recentTransactions: transactions
  };
};

