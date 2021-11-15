const express = require('express');
const router = express.Router();

const ctrlTransactions = require('../../controllers/transactions');
// const {} = require('./validation');  // TODO: add server-side validation

const guard = require('../../helpers/guard');
const wrapError = require('../../helpers/errorHandler');

router.get('/', wrapError(ctrlTransactions.getTransactions));
// TODO: uncomment and replace when auth issues are ready on frontend
// router.get('/', guard, wrapError(ctrlTransactions.getTransactions));

router.post('/', guard, wrapError(ctrlTransactions.saveTransaction));

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

router.get('/stats', wrapError(ctrlTransactions.getTransactionStats));
// TODO: uncomment and replace when auth issues are ready on frontend
// router.get('/stats', guard, wrapError(ctrlTransactions.getTransactionStats));

module.exports = router;
