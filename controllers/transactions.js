const Transactions = require('../repository/transactions');
const Categories = require('../repository/categories');

const { HttpCode, ResponseStatus } = require('../config/constants');
const { CustomError } = require('../helpers/customError');

const getTransactions = async (req, res) => {
  const userId = req.user._id;
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

  const transactionDate = new Date(req.body.date);
  const month = transactionDate.getMonth() + 1;
  const year = transactionDate.getFullYear();
  const { isExpense } = await Categories.getCategoryById(req.body.category);
  const balanceAfter = 0;

  const { newBalance, transactions, pageInfo } =
    await Transactions.addTransaction(
      {
        ...req.body,
        month,
        year,
        isExpense,
        balanceAfter,
        owner: userId,
      },
      req.query,
    );

  res.status(HttpCode.CREATED).json({
    status: ResponseStatus.SUCCESS,
    code: HttpCode.CREATED,
    data: { balance: newBalance, transactions, pageInfo },
  });
};

const removeTransaction = async (req, res) => {
  const userId = req.user._id;

  const result = await Transactions.removeTransaction(
    req.params.transactionId,
    userId,
    req.query,
  );

  if (result) {
    const { newBalance, deletedTransaction, transactions, pageInfo } = result;

    return res.status(HttpCode.OK).json({
      status: ResponseStatus.SUCCESS,
      code: HttpCode.OK,
      data: { newBalance, deleted: deletedTransaction, transactions, pageInfo },
    });
  }

  throw new CustomError(HttpCode.NOT_FOUND, 'Not found');
};

const updateTransaction = async (req, res) => {
  const userId = req.user._id;

  const result = await Transactions.updateTransaction(
    req.params.transactionId,
    req.body,
    userId,
    req.query,
  );

  if (!result) {
    throw new CustomError(HttpCode.NOT_FOUND, 'Not found');
  }

  const { newBalance, updatedTransaction, transactions, pageInfo } = result;

  if (updatedTransaction) {
    return res.status(HttpCode.OK).json({
      status: ResponseStatus.SUCCESS,
      code: HttpCode.OK,
      data: { newBalance, updatedTransaction, transactions, pageInfo },
    });
  }

  throw new CustomError(HttpCode.NOT_FOUND, 'Not found');
};

const getTransactionStats = async (req, res) => {
  const userId = req.user._id;

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
