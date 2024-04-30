const response = require('../helpers/response.helper');
const responseMessage = require('../config/messages/en');
const constants = require('../config/constants');
const userService = require('../dbService/user.service');

/**
 * test request
 * @param {*} req request object = HTTP
 * @param {*} res response object = HTTP
 * @param {*} next next function = HTTP
 * @return {Object} response object
 */
const ping = async (req, res, next) => {
  try {
    const userCounts = await userService.userCounts();
    return response.helper(
        res,
        true,
        responseMessage.WELCOME,
        {userCounts},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  ping,
};
