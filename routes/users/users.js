const express = require('express');
const router = express.Router();
const passport = require('passport');
const guard = require('../../helpers/guard');
// const loginLimit = require('../../helpers/rate-limit-login');
const wrapError = require('../../helpers/errorHandler');
const upload = require('../../helpers/uploads');

require('dotenv').config();
require('../../helpers/google-auth');

const {
  registration,
  login,
  logout,
  current,
  updateUser,
  uploadAvatar,
  verifyUser,
  repeatEmailForVerifyUser,
  loginByGoogle,
} = require('../../controllers/users');

const {
  validateRegistration,
  validateLogin,
  validateUserPatch,
  validateLoginByGoogle,
} = require('./validation');

router.post('/signup', validateRegistration, wrapError(registration));

// Установка лимита на логин с одного IP(3р в течение часа)loginLimit,
router.post('/login', validateLogin, wrapError(login));
router.post('/loginByGoogle', validateLoginByGoogle, wrapError(loginByGoogle));

router.post('/logout', guard, wrapError(logout));
router.get('/current', guard, wrapError(current));

router.patch('/', guard, validateUserPatch, wrapError(updateUser));

// Загрузка avatar
router.patch(
  '/avatar',
  guard,
  upload.single('avatar'),
  wrapError(uploadAvatar),
);

// Email
router.get('/verify/:token', wrapError(verifyUser));

// В body отправляем email по которому повторно верифицируем
router.post('/verify', wrapError(repeatEmailForVerifyUser));

// Google auth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);
router.get('/google/callback', passport.authenticate('google'), (req, res) => {
  const token = req.user.token;
  res.redirect(`${process.env.FRONTEND_LINK}?token=${token}`);
});

module.exports = router;
