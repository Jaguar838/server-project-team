const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const usersRouter = require('./routes/users/users');
const transactionsRouter = require('./routes/transactions/transactions');
const categoriesRouter = require('./routes/categories/categories');
const swaggerRouter = require('./routes/swagger/swagger');

// protect against CSRF attacks
const helmet = require('helmet');
// Пакет для работы с query boolean - переводит String to Boolean
const boolParser = require('express-query-boolean');
const { HttpCode } = require('./config/constants');
require('dotenv').config();
const AVATAR_OF_USERS = process.env.AVATAR_OF_USERS;

const app = express();
app.use(express.static(AVATAR_OF_USERS));

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';
app.use(helmet());

// remove logs in test mode
app.get('env') !== 'test' && app.use(logger(formatsLogger));

// Настройки для локалхоста
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  }),
);

// parse application/json limit 10Kb
app.use(express.json({ limit: 10000 }));
app.use(boolParser());

// Routes
app.use('/api/users', usersRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/docs', swaggerRouter);

app.use((req, res) => {
  res
    .status(HttpCode.NOT_FOUND)
    .json({ status: 'error', code: HttpCode.NOT_FOUND, message: 'Not found' });
});

app.use((err, res) => {
  console.log('🚀 ~ file: app.js ~ line 44 ~ app.use ~ err', err);
  const statusCode = err.status || HttpCode.INTERNAL_SERVER_ERROR;
  res.status(statusCode).json({
    status: statusCode === HttpCode.INTERNAL_SERVER_ERROR ? 'fail' : 'error',
    code: statusCode,
    message: err.message,
  });
});

module.exports = app;
