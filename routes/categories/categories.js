const express = require('express');
const router = express.Router();

const ctrlCategories = require('../../controllers/categories');
// const {} = require('./validation');  // TODO: add server-side validation

const guard = require('../../helpers/guard');
const wrapError = require('../../helpers/errorHandler');

router.get('/', guard, wrapError(ctrlCategories.getCategories));

module.exports = router;
