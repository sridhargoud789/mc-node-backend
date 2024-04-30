const response = require('../helpers/response.helper');
const constants = require('../config/constants');

/**
 * This function is used to validate request body with specific schema
 * @returns {} if error send back response otherwise call to next function
 */

const bodyValidator = (Schema) => {
  return async (req, res, next) => {
    const validate = await Schema.validate(req.body);
    let message = '';
    if (validate.error) {
      message = validate.error.details[0].message;
      message = message.replace(/"/g, '');
      return response.helper(
          res,
          false,
          message,
          {},
          constants.responseStatus.SUCCESS,
      );
    }
    next();
  };
};

const queryValidator = (Schema) => {
  return async (req, res, next) => {
    const validate = await Schema.validate(req.query);
    let message = '';
    if (validate.error) {
      message = validate.error.details[0].message;
      message = message.replace(/"/g, '');
      return response.helper(
          res,
          false,
          message,
          {},
          constants.responseStatus.BAD_REQUEST,
      );
    }
    next();
  };
};

module.exports = {
  queryValidator,
  bodyValidator,
};
