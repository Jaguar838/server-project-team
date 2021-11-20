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

      ...(sortBy
        ? sortBy.split`|`.reduce((acc, item) => ({ ...acc, [item]: 1 }), {})
        : {}),

      ...(sortByDesc
        ? sortByDesc.split`|`.reduce(
            (acc, item) => ({ ...acc, [item]: -1 }),
            {},
          )
        : {}),

      ...(!sortBy?.includes('createdAt') && !sortByDesc?.includes('createdAt')
        ? { createdAt: 1 }
        : {}),
    },
    select: filter ? filter.split`|`.join` ` : '',
    populate: {
      path: 'category',
      select: 'name color',
    },
  });

  const { docs: transactions, ...pageInfo } = results;

  return { pageInfo, transactions };
};

const getTransactionById = async (transactionId, userId) => {
  const result = await Transaction.findOne({
    _id: transactionId,
    owner: userId,
  });

  return result;
};

const addTransaction = async details => {
  const { owner: userId, date, amount, isExpense } = details;

  const { transactions } = await listTransactions(userId, {});
  const lastTransaction = findLastTransaction(transactions);
  const latestPrevTransaction = findLatestPrevTransaction(transactions, date);
  const laterTransactions = findLaterTransactions(transactions, date);

  const amountChange = amount * (isExpense ? -1 : 1);

  details.balanceAfter =
    (latestPrevTransaction?.balanceAfter || 0) + amountChange;

  await Transaction.create(details);
  await updateBalanceForTransactions(laterTransactions, amountChange);

  const newUserBalance = (lastTransaction?.balanceAfter || 0) + amountChange;
  await Users.updateBalance(userId, newUserBalance);

  const { transactions: updatedTransactions } = await listTransactions(userId, {
    sortByDesc: 'date|createdAt',
  });

  return { newBalance: newUserBalance, transactions: updatedTransactions };
};

const removeTransaction = async (transactionId, userId) => {
  const transactionToDelete = await Transaction.findOne({
    _id: transactionId,
    owner: userId,
  });
  if (!transactionToDelete) return null;

  const { date, createdAt, amount, isExpense } = transactionToDelete;

  const { transactions } = await listTransactions(userId, {});
  const lastTransaction = findLastTransaction(transactions);
  const laterTransactions = findLaterTransactions(
    transactions,
    date,
    createdAt,
  );

  const amountChange = -1 * amount * (isExpense ? -1 : 1);

  await Transaction.findByIdAndRemove(transactionId);
  await updateBalanceForTransactions(laterTransactions, amountChange);

  const newUserBalance = (lastTransaction?.balanceAfter || 0) + amountChange;
  await Users.updateBalance(userId, newUserBalance);

  const { transactions: updatedTransactions } = await listTransactions(userId, {
    sortByDesc: 'date|createdAt',
  });

  return { newBalance: newUserBalance, transactions: updatedTransactions };
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

const updateBalanceForTransactions = async (transactions, amount) => {
  await transactions.forEach(async ({ _id, balanceAfter }) => {
    await Transaction.findOneAndUpdate(
      { _id },
      { balanceAfter: balanceAfter + amount },
    );
  });
};

const findLastTransaction = transactions => {
  return transactions.reduce(
    (acc, transaction) =>
      transaction.date > acc.date ||
      (transaction.date >= acc.date && transaction.createdAt > acc.createdAt)
        ? transaction
        : acc,
    { date: 0, createdAt: 0 },
  );
};

const findLatestPrevTransaction = (
  transactions,
  date,
  createdAt = new Date(),
) => {
  date = new Date(date);
  createdAt = new Date(createdAt);

  return transactions.reduce(
    (acc, transaction) =>
      transaction.date > date ||
      (transaction.date >= date && transaction.createdAt > createdAt) ||
      transaction.date < acc.date ||
      (transaction.date <= acc.date && transaction.createdAt < acc.createdAt)
        ? acc
        : transaction,
    { date: 0, createdAt: 0 },
  );
};

const findLaterTransactions = (transactions, date, createdAt = new Date()) => {
  date = new Date(date);
  createdAt = new Date(createdAt);

  return transactions.filter(
    transaction =>
      transaction.date > date ||
      (transaction.date >= createdAt && transaction.date > createdAt),
  );
};

module.exports = {
  listTransactions,
  getTransactionById,
  addTransaction,
  removeTransaction,
  updateTransaction,
  listTransactionStats,
  updateBalanceForTransactions,
};
