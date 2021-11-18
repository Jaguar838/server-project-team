const Transaction = require('../model/transaction');
const Users = require('./users');

const listTransactions = async (userId, query) => {
  const { sortBy = 'date', sortByDesc, filter, page = 1, limit = 1e12 } = query;
  const searchOptions = { owner: userId };

  const results = await Transaction.paginate(searchOptions, {
    limit,
    page,
    sort: {
      ...(!sortBy && !sortByDesc ? { date: 1 } : {}),
      ...(sortBy ? { [`${sortBy}`]: 1 } : {}),
      ...(sortByDesc ? { [`${sortByDesc}`]: -1 } : {}),
      createdAt: 1,
    },
    select: filter ? filter.split('|').join(' ') : '',
    populate: {
      path: 'category',
      select: 'name color',
    },
  });

  const { docs: transactions, ...pageInfo } = results;

  return { pageInfo, transactions };
};

const addTransaction = async body => {
  await Transaction.create(body);
  await updateBalanceForLaterTransactions(body.date);

  const newBalance = (await Users.findById(body.owner)).balance;

  return newBalance;
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
  const allTransactions = await Transaction.find({
    owner: userId,
    month,
    year,
  });

  const stats = allTransactions.reduce((acc, { category, amount }) => {
    const id = category.toString();

    return {
      ...acc,
      [id]: acc[id] ? acc[id] + amount : amount,
    };
  }, {});

  return stats;
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
