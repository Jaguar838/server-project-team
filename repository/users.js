const User = require('../model/user');

const create = async options => {
  const user = new User(options);
  return await user.save();
};

const findById = async id => {
  return await User.findById(id);
};

const findByEmail = async email => {
  return await User.findOne({ email });
};

const findUserByVerifyToken = async verifyTokenEmail => {
  return await User.findOne({ verifyTokenEmail });
};

const updateBalance = async (id, balance) => {
  console.log(id, balance);
  return await User.updateOne({ _id: id }, { balance });
};

const updateToken = async (id, token) => {
  return await User.updateOne({ _id: id }, { token });
};

const updateTokenVerify = async (id, isVerified, verifyTokenEmail) => {
  return await User.updateOne({ _id: id }, { isVerified, verifyTokenEmail });
};

const updateAvatar = async (id, avatar, avatarId = null) => {
  return await User.updateOne({ _id: id }, { avatar, avatarId });
};

module.exports = {
  findById,
  findByEmail,
  create,
  updateToken,
  updateAvatar,
  updateBalance,
  updateTokenVerify,
  findUserByVerifyToken,
};
