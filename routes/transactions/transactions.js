const express = require('express');
const router = express.Router();

const ctrlTransactions = require('../../controllers/transactions');
const { validateSaveTransaction } = require('./validation');

const guard = require('../../helpers/guard');
const wrapError = require('../../helpers/errorHandler');

router.get('/', guard, wrapError(ctrlTransactions.getTransactions));

router.post(
  '/',
  guard,
  validateSaveTransaction,
  wrapError(ctrlTransactions.saveTransaction),
);

router.patch(
  '/:transactionId',
  guard,
  wrapError(ctrlTransactions.updateTransaction),
);

router.delete(
  '/:transactionId',
  guard,
  wrapError(ctrlTransactions.removeTransaction),
);

router.get('/stats', guard, wrapError(ctrlTransactions.getTransactionStats));

module.exports = router;
