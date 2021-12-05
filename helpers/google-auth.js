const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../model/user');
require('dotenv').config();

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BACKEND_LINK, JWT_SECRET_KEY } =
  process.env;

const generateToken = id => {
  return jwt.sign({ id }, JWT_SECRET_KEY, {
    expiresIn: '7d',
  });
};

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_LINK}api/users/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile._json.email;
      const name = profile.name.givenName;

      const currentUser = await User.findOne({ email });

      if (!currentUser) {
        const newUser = await User.create({
          name,
          email,
          verifyTokenEmail: null,
          isVerified: true,
        });
        const token = generateToken(newUser._id.toString());
        await User.updateOne({ email }, { token });
        done(null, { token });
      }

      const token = generateToken(currentUser._id.toString());
      await User.updateOne({ email }, { token });
      done(null, { token });
    },
  ),
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
