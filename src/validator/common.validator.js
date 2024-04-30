const Joi = require('joi');

module.exports.signupRequest = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
  phone_number: Joi.string().required(),
  adult: Joi.number().allow(0, 1).required(),
  accept_private_policy: Joi.number().allow(0, 1).required(),
  walletAddress: Joi.string().optional(),
  name: Joi.string().optional(),
  sourse: Joi.string().optional().allow(''),
  is_phone_verified: Joi.number().optional().allow(1),
  course_id: Joi.optional().allow(''),
});
