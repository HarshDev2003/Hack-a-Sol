import Transaction from '../models/Transaction.js';

export const listTransactions = async ({ ownerId, category, search }) => {
  const query = { owner: ownerId };

  if (category && category !== 'all') {
    query.category = new RegExp(`^${category}$`, 'i');
  }

  if (search) {
    query.$or = [
      { merchant: new RegExp(search, 'i') },
      { category: new RegExp(search, 'i') }
    ];
  }

  return Transaction.find(query).sort({ date: -1 });
};

export const getTransactionSummary = async ({ ownerId }) => {
  const aggregate = await Transaction.aggregate([
    { $match: { owner: ownerId } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' }
      }
    }
  ]);

  return aggregate.reduce(
    (acc, item) => {
      acc[item._id] = item.total;
      return acc;
    },
    { income: 0, expense: 0 }
  );
};

