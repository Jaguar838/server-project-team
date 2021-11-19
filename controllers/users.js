const jwt = require('jsonwebtoken');
const Users = require('../repository/users');
const { HttpCode } = require('../config/constants');
const { CustomError } = require('../helpers/customError');

// Email
const EmailService = require('../services/email/service');
const { CreateSenderNodemailer } = require('../services/email/sender');
require('dotenv').config();

// file upload
const path = require('path');
const mkdirp = require('mkdirp');
const UploadService = require('../services/avatars/file-upload');

const SECRET_KEY = process.env.JWT_SECRET_KEY;

const registration = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await Users.findByEmail(email);
  if (user) {
    throw new CustomError(HttpCode.CONFLICT, 'Email is already in use');
  }

  // Создаем нового пользователя и verifyToken
  const newUser = await Users.create({ name, email, password });
  const emailService = new EmailService(
    process.env.NODE_ENV,
    new CreateSenderNodemailer(),
  );
  const statusEmail = await emailService.sendVerifyEmail(
    newUser.email,
    newUser.name,
    newUser.verifyTokenEmail,
  );
  return res.status(HttpCode.CREATED).json({
    status: 'success',
    code: HttpCode.CREATED,
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      successEmail: statusEmail,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await Users.findByEmail(email);
  const isValidPassword = await user?.isValidPassword(password);
  // Возвращаем ошибку если пользователь:
  // 1) не сущ. в db;
  // 2) ввел не валидный пароль;
  // 3) состояние isVerified = false.

  if (!user || !isValidPassword) {
    throw new CustomError(HttpCode.UNAUTHORIZED, 'Invalid credentials');
  }

  if (!user?.isVerified) {
    throw new CustomError(
      HttpCode.UNAUTHORIZED,
      'User email not verified yet.',
    );
  }

  const id = user._id;
  const payload = { id };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '2h' });
  await Users.updateToken(id, token);

  const { name, balance } = user;

  return res.status(HttpCode.OK).json({
    status: 'success',
    code: HttpCode.OK,
    data: {
      email,
      name,
      balance,
      token,
    },
  });
};

const logout = async (req, res) => {
  const id = req.user._id;
  await Users.updateToken(id, null);
  return res.status(HttpCode.NO_CONTENT).json({ test: 'test' });
};

const current = async (req, res) => {
  const userId = req.user._id;
  const user = await Users.findById(userId);
  if (user) {
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      message: 'Current user',
      data: {
        // user,
        id: user.id,
        email: user.email,
        name: user.name,
        balance: user.balance,
        avatar: user.avatar,
      },
    });
  }
  throw new CustomError(HttpCode.NOT_FOUND, 'Not Found');
};

const update = async (req, res) => {
  const userId = req.user._id;
  const user = await Users.updateSubscription(userId, req.body);
  if (user) {
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  }
  throw new CustomError(HttpCode.NOT_FOUND, 'Not Found');
};

// Local upload
const uploadAvatar = async (req, res) => {
  const id = String(req.user._id);
  const file = req.file;
  const AVATAR_OF_USERS = process.env.AVATAR_OF_USERS;
  const destination = path.join(AVATAR_OF_USERS, id);
  await mkdirp(destination);
  const uploadService = new UploadService(destination);
  const avatarUrl = await uploadService.save(file, id);
  await Users.updateAvatar(id, avatarUrl);
  return res.status(200).json({
    status: 'success',
    code: 200,
    data: {
      avatar: avatarUrl,
    },
  });
  // const pic = req.file;
  // console.log(pic);
  // return res.status(HttpCode.OK).json({ pic });
};

// Controllers verify User
const verifyUser = async (req, res) => {
  const user = await Users.findUserByVerifyToken(req.params.token);
  if (user) {
    const id = user._id;

    await Users.updateTokenVerify(user._id, true, null);

    const payload = { id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '240h' });
    await Users.updateToken(id, token);

    const redirectURL = `${process.env.FRONTEND_LINK}/login/${token}`;

    return res.redirect(redirectURL);

    // return res.status(HttpCode.OK).json({
    //   status: 'success',
    //   code: HttpCode.OK,
    //   data: {
    //     message: 'Verification successful!',
    //   },
    // });
  }
  return res.status(HttpCode.BAD_REQUEST).json({
    status: 'error',
    code: HttpCode.BAD_REQUEST,
    message: 'Invalid token',
  });
};

// Controllers repeat email  for verify User
const repeatEmailForVerifyUser = async (req, res) => {
  const { email } = req.body;
  const user = await Users.findByEmail(email);

  if (!user) {
    throw new CustomError(HttpCode.NOT_FOUND, 'Not found');
  }

  if (user?.isVerified) {
    throw new CustomError(
      HttpCode.BAD_REQUEST,
      'Verification has already been passed',
    );
  }

  const { name, verifyTokenEmail } = user;
  const emailService = new EmailService(
    process.env.NODE_ENV,
    new CreateSenderNodemailer(),
  );
  // debugger;
  const statusEmail = await emailService.sendVerifyEmail(
    email,
    name,
    verifyTokenEmail,
  );

  return res.status(HttpCode.OK).json({
    status: 'success',
    code: HttpCode.OK,
    data: {
      message: 'Verification email sent',
    },
  });
};
module.exports = {
  registration,
  login,
  logout,
  current,
  update,
  uploadAvatar,
  verifyUser,
  repeatEmailForVerifyUser,
};
