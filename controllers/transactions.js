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

  const years = [...new Set(transactions.map(({ year }) => year))].sort();

  res.status(HttpCode.OK).json({
    status: ResponseStatus.SUCCESS,
    code: HttpCode.OK,
    data: { years, transactions, pageInfo },
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

  let month = Number(req.query.month);
  let year = Number(req.query.year);
  !month && year && (month = { $lte: 12 });
  month || (month = new Date(Date.now()).getMonth() + 1);
  year || (year = new Date(Date.now()).getFullYear());
  // TODO: add using getTimezoneOffset()

  const allCategories = await Categories.listCategories();

  const expenseCategoriesIdList = allCategories
    .filter(({ isExpense }) => isExpense)
    .map(({ _id }) => _id.toString());
  const incomeCategoriesIdList = allCategories
    .filter(({ isExpense }) => !isExpense)
    .map(({ _id }) => _id.toString());

  const userStats = await Transactions.listTransactionStats(
    userId,
    month,
    year,
  );

  const expenseStats = expenseCategoriesIdList.reduce(
    (acc, id) => ({ ...acc, [id]: userStats[id] || 0 }),
    {},
  );
  const incomeStats = incomeCategoriesIdList.reduce(
    (acc, id) => ({ ...acc, [id]: userStats[id] || 0 }),
    {},
  );

  const totalExpenseAmount = Object.values(expenseStats).reduce(
    (acc, amount) => acc + amount,
  );
  const totalIncomeAmount = Object.values(incomeStats).reduce(
    (acc, amount) => acc + amount,
  );

  const summary = {
    expenseStats: Object.entries(expenseStats).map(([categoryId, amount]) => ({
      categoryId,
      amount,
    })),
    expenses: totalExpenseAmount,
    incomes: totalIncomeAmount,
  };

  res.status(HttpCode.OK).json({
    status: ResponseStatus.SUCCESS,
    code: HttpCode.OK,
    data: summary,
  });
};

module.exports = {
  getTransactions,
  saveTransaction,
  removeTransaction,
  updateTransaction,
  getTransactionStats,
};
