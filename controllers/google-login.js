const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(
  '516350701159-h40lcnb8kgtv81mnomi4ugrhobi0a9gb.apps.googleusercontent.com',
);
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = process.env;
const { User } = require('../../models');

const { nanoid } = require('nanoid');

const { users: service } = require('../../services');

const googlelogin = (req, res) => {
  const { tokenId } = req.body;
  client
    .verifyIdToken({
      idToken: tokenId,
      audience:
        '516350701159-h40lcnb8kgtv81mnomi4ugrhobi0a9gb.apps.googleusercontent.com',
    })
    .then(response => {
      const { email_verified, name, email } = response.payload;

      if (email_verified) {
        User.findOne({ email }).exec((err, user) => {
          const verifyToken = nanoid();
          if (err) {
            return res.status(400).json({ error: 'Something went wrong....' });
          } else {
            if (user) {
              const token = jwt.sign({ id: user.id }, SECRET_KEY);

              const { id, email, verifyToken } = user;

              service.update(user.id, { token });

              res.json({
                user: { id, token, email, verifyToken },
              });
            } else {
              let password = email + SECRET_KEY;

              let newUser = new User({
                name,
                email,
                password,
                verifyToken,
              });
              newUser.save((err, data) => {
                if (err) {
                  return res
                    .status(400)
                    .json({ error: 'Something went wrong....' });
                }

                const token = jwt.sign({ id: data.id }, SECRET_KEY);

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

module.exports = googlelogin;
// Source: https://stackoverflow.com/a/67867228 .
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import UserModel from './../models/user';
var jwt = require('jsonwebtoken');

// @desc    Login with google
// @route   POST /api/user/google-login
// @access  Public

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const signInWithGoogle = async (req: Request, res: Response) => {
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
                role,
                token,
              });
            });
          }
        });
      }
    });
};
