const express = require('express');
const router = express.Router();

const ctrlCategories = require('../../controllers/categories');
// const {} = require('./validation');  // TODO: add server-side validation

const wrapError = require('../../helpers/errorHandler');

router.get('/', wrapError(ctrlCategories.getCategories));

module.exports = router;
