const constants = require('../config/constants');
const config = require('../config/config');
const logger = require('../config/logger');
/**
 * This function is used to handler each error and send mail to admin
 * @param {*} err error object from previous function
 * @param {*} req request object from HTTP request
 * @param {*} res response object from HTTP request
 * @param {*} next next function to call
 * @return {Object} return error to client
 */
module.exports = async (err, req, res, next) => {
  logger.error(err);
  return res.status(err.statusCode || 500).send({
    status: false,
    message: err.message || 'Something went wront, server error',
  });
};
