const Transactions = require('../repository/transactions');
const Categories = require('../repository/categories');

const { HttpCode, ResponseStatus } = require('../config/constants');
const { CustomError } = require('../helpers/customError');

const getTransactions = async (req, res) => {
  const userId = req?.user?._id; // TODO: replace ?.
  const { pageInfo, transactions } = await Transactions.listTransactions(
    userId,
    req.query,
  );

  res.status(HttpCode.OK).json({
    status: ResponseStatus.SUCCESS,
    code: HttpCode.OK,
    data: { pageInfo, transactions },
  });
};

const saveTransaction = async (req, res) => {
  const userId = req.user._id;
  const balanceAfter = 10000.0; // TODO: add calculation of balance after transaction

  const transaction = await Transactions.addTransaction({
    ...req.body,
    balanceAfter,
    owner: userId,
  });

  res.status(HttpCode.CREATED).json({
    status: ResponseStatus.SUCCESS,
    code: HttpCode.CREATED,
    data: { transaction },
  });
};

const removeTransaction = async (req, res) => {
  const userId = req.user._id;
  const transaction = await Transactions.removeTransaction(
    req.params.transactionId,
    userId,
  );

  if (transaction) {
    return res.status(HttpCode.OK).json({
      status: ResponseStatus.SUCCESS,
      code: HttpCode.OK,
      message: 'Deleted',
      data: { transaction },
    });
  }

  throw new CustomError(HttpCode.NOT_FOUND, 'Not found');
};

const updateTransaction = async (req, res) => {
  const userId = req.user._id;
  const transaction = await Transactions.updateTransaction(
    req.params.transactionId,
    req.body,
    userId,
  );

  if (transaction) {
    return res.status(HttpCode.OK).json({
      status: ResponseStatus.SUCCESS,
      code: HttpCode.OK,
      data: { transaction },
    });
  }
  throw new CustomError(HttpCode.NOT_FOUND, 'Not found');
};

const getTransactionStats = async (req, res) => {
  const userId = req?.user?._id; // TODO: replace ?.
  const { month, year } = req.query;

  const allCategories = await (
    await Categories.listCategories()
  ).map(({ name }) => name);
  const userStats = await Transactions.listTransactionStats(
    userId,
    month,
    year,
  );

  // TODO: process month and year parameters here
  const finalStats = allCategories.reduce(
    (acc, category) => ({ ...acc, [category]: userStats[category] || 0 }),
    {},
  );

  res.status(HttpCode.OK).json({
    status: ResponseStatus.SUCCESS,
    code: HttpCode.OK,
    data: finalStats,
  });
};

module.exports = {
  getTransactions,
  saveTransaction,
  removeTransaction,
  updateTransaction,
  getTransactionStats,
};
