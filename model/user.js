const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const SALT_FACTOR = 3;

const userSchema = new Schema(
  {
    name: {
      type: String,
      min: 2,
      max: 30,
      default: 'Guest',
    },
    email: {
      type: String,
      required: [true, 'Set email for user'],
      unique: true,
      validate(value) {
        const re = /\S+@\S+.\S+/;
        return re.test(String(value).toLowerCase());
      },
    },
    password: {
      type: String,
      // required: [true, 'Set password for user'],
    },
    balance: {
      type: Number,
      default: 0,
    },
    token: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: function () {
        return null;
      },
    },
    avatarId: {
      type: String,
      default: null,
    },

    //  Email verify
    // Изначально любой зарегестрированный пользователь не верифицирован - false
    isVerified: { type: Boolean, default: false },

    // но у него есть для верификации токен генерируемый по умолчанию в db.
    verifyTokenEmail: {
      type: String,
      /*
      required: [true, 'Verify token is required'],
      */
      default: crypto.randomUUID(),
    },
  },

  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(SALT_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = model('user', userSchema);

module.exports = User;
