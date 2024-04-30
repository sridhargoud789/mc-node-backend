const jwt = require('jsonwebtoken');
const config = require('../config/config');

const encrypt = (data) => {
  return jwt.sign({data}, config.ENCRYPTION_KEY);
};

const generateToken = (data) => {
  return jwt.sign({data}, config.ENCRYPTION_KEY, {
    expiresIn: config.AUTH_TOKEN_EXPIRY,
  });
};

const decrypt = (encryptData) => {
  return jwt.verify(encryptData, config.ENCRYPTION_KEY);
};

module.exports = {
  encrypt,
  decrypt,
  generateToken,
};
