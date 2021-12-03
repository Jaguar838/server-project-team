// https://googleapis.dev/nodejs/google-auth-library/5.8.0/interfaces/TokenPayload.html

const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const { GOOGLE_CLIENT_ID } = process.env;
const { JWT_SECRET_KEY } = process.env;
const { User } = require('../model/user');
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// @desc    Login with google
// @route   POST /api/users/google-login нада создать
// @access  Public

const signInWithGoogle = async (req, res) => {
  const { tokenId } = req.body;
  const ticket = await client
    .verifyIdToken({
      idToken: tokenId,
      audience: GOOGLE_CLIENT_ID,
    })
    .then(response => {
      const { email_verified, name, email } = response.payload;

      if (email_verified) {
        User.findOne({ email }).exec((err, user) => {
          if (err) {
            return res.status(400).json({ error: 'Something went wrong....' });
          } else {
            if (user) {
              const token = jwt.sign({ id: user.id }, JWT_SECRET_KEY, {
                expiresIn: '7d',
              });

              const { id, email, verifyTokenEmail } = user;

              service.update(user.id, { token });

              res.json({
                user: { id, token, email, verifyTokenEmail },
              });
            } else {
              const password = email + JWT_SECRET_KEY;
              // const password = `${email}${process.env.JWT_SECRET_KEY}`;

              let newUser = new User({
                name,
                email,
                password,
                verifyTokenEmail,
              });
              newUser.save((err, data) => {
                if (err) {
                  return res
                    .status(400)
                    .json({ error: 'Something went wrong....' });
                }

                const token = jwt.sign({ id: data.id }, JWT_SECRET_KEY, {
                  expiresIn: '7d',
                });

                const { id, email } = newUser;

                service.update(data.id, { token });

                res.json({
                  user: { id, token, email },
                });
              });
            }
          }
        });
      }
    });
};

module.exports = signInWithGoogle;

// Source: https://stackoverflow.com/a/67867228 .
import { OAuth2Client } from 'google-auth-library';
import UserModel from '../model/user';
var jwt = require('jsonwebtoken');

// @desc    Login with google
// @route   POST /api/user/google-login
// @access  Public

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const signInWithGoogle = async (req, res) => {
  const { idToken } = req.body;
  const ticket = await client
    .verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    .then(response => {
      if (response.getPayload() && response.getPayload()?.email_verified) {
        const email = response.getPayload()?.email;
        const name = response.getPayload()?.name;

        UserModel.findOne({ email }).exec((err, user) => {
          if (user) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: '7d',
            });
            const { _id, email, name, role } = user;
            return res.json({
              _id,
              name,
              email,
              role,
              token,
            });
          } else {
            const password = `${email}${process.env.JWT_SECRET}`;
            user = new UserModel({ name, email, password });
            user.save((err, data) => {
              if (err) {
                console.log('ERROR GOOGLE LOGIN ON USER SAVE', err);
                return res.status(400).json({
                  error: 'Google Login Failed',
                });
              }
              const token = jwt.sign(
                { _id: data._id },
                process.env.JWT_SECRET,
                {
                  expiresIn: '7d',
                },
              );
              const { _id, email, name, role } = data;
              return res.json({
                _id,
                name,
                email,
                token,
              });
            });
          }
        });
      }
    });
};
