const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { HttpCode } = require('../../config/constants');

const schemaRegistration = Joi.object({
  name: Joi.string().min(1).max(12).optional(),
  email: Joi.string().email().required(),
  password: Joi.string().alphanum().min(6).required(),
});

const schemaLogin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().alphanum().min(6).required(),
});

const schemaLoginByGoogle = Joi.object({
  token: Joi.string().required(),
});

const schemaPatch = Joi.object({
  name: Joi.string().min(1).max(12).optional(),
  email: Joi.string().email().optional(),
}).min(1);

const validate = async (schema, obj, res, next) => {
  try {
    await schema.validateAsync(obj);
    next();
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'error',
      code: HttpCode.BAD_REQUEST,
      message: `Field ${err.message.replace(/"/g, '')}`,
    });
  }
};

module.exports.validateRegistration = async (req, res, next) => {
  return await validate(schemaRegistration, req.body, res, next);
};

module.exports.validateLogin = async (req, res, next) => {
  return await validate(schemaLogin, req.body, res, next);
};

module.exports.validateLoginByGoogle = async (req, res, next) => {
  return await validate(schemaLoginByGoogle, req.body, res, next);
};

module.exports.validateUserPatch = async (req, res, next) => {
  return await validate(schemaPatch, req.body, res, next);
};
