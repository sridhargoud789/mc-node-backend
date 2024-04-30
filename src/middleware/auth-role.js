const {decrypt} = require('../helpers/jwt');
const response = require('../helpers/response.helper');
const userService = require('../dbService/user.service');
const constants = require('../config/constants');
/**
 * This function is used to check role permission with validate auth token
 * @return {} this function return unauthorized error if request is not valid otherwise
 * call next function
 */

module.exports = (...permissionsRequired) => {
  return async (req, res, next) => {
    const {authorization} = req.headers;
    let decoded;
    if (!authorization) {
      return response.helper(
          res,
          false,
          'TOKEN_REQUIRED',
          {},
          constants.responseStatus.FORBIDDEN,
      );
    }
    try {
      decoded = decrypt(authorization);
    } catch (e) {
      return response.helper(
          res,
          false,
          'AUTH_TOKEN_EXPIRED',
          {},
          constants.responseStatus.UN_AUTHORIZED,
      );
    }

    const {data} = decoded;
    const user = await userService.userLoginData(data.id);
    if (!user) {
      return response.helper(
          res, false,
          'USER_NOT_EXIST',
          {},
          constants.responseStatus.FORBIDDEN,
      );
    }
    req.token = authorization;
    req.user = user;
    const userRole = user.roles.code;
    if(permissionsRequired.length) {
    if (permissionsRequired.includes(userRole)) {
      next();
      } else {
        return response.helper(
          res,
          false,
          'UN-AUTHORIZED',
          {},
          constants.responseStatus.UN_AUTHORIZED);

      } 
    } else {
      next();
    }
  };
};
