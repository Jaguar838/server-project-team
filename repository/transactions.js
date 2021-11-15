const Transaction = require('../model/transaction');

const listTransactions = async (userId, query) => {
  const { sortBy, sortByDesc, filter, page = 1, limit = 1e12 } = query;

  const searchOptions = {};
  // TODO: uncomment and replace when auth issues are ready on frontend
  // const searchOptions = { owner: userId };

  const results = await Transaction.paginate(searchOptions, {
    limit,
    page,
    sort: {
      ...(sortBy ? { [`${sortBy}`]: 1 } : {}),
      ...(sortByDesc ? { [`${sortByDesc}`]: -1 } : {}),
    },
    select: filter ? filter.split('|').join(' ') : '',
    // populate: {
    //   path: 'owner',
    //   select: 'email balance createdAt updatedAt',
    // },
  });

  const { docs: transactions, ...pageInfo } = results;

  return { pageInfo, transactions };
};

const addTransaction = async body => {
  const result = await Transaction.create(body);
  await updateBalanceForLaterTransactions(result); //
  return result;
};

const removeTransaction = async (transactionId, userId) => {
  const result = await Transaction.findOneAndRemove({
    _id: transactionId,
    owner: userId,
  });
  return result;
};

const updateTransaction = async (transactionId, body, userId) => {
  const result = await Transaction.findOneAndUpdate(
    { _id: transactionId, owner: userId },
    { ...body },
    { new: true },
  );
  return result;
};

const listTransactionStats = async (userId, month, year) => {
  // TODO: complete this function
  const allTransactions = await Transaction.find({});
  const expenseStats = allTransactions.reduce(
    (acc, { category, amount }) => ({
      ...acc,
      [category]: acc[category] ? acc[category] + amount : amount,
    }),
    {},
  );

  return expenseStats;
};

const updateBalanceForLaterTransactions = async ({ date, createdAt }) => {
  // TODO: complete this function
};

module.exports = {
  listTransactions,
  addTransaction,
  removeTransaction,
  updateTransaction,
  listTransactionStats,
  updateBalanceForLaterTransactions,
};
