const logger = require('../config/logger');
const mysql = require('mysql2');
const globConfig = require('../config/config');
const configJSON = require('../../config/config');

require('../../models/index');

/**
 * This function is used to connect server to cloud database
 * @return {Boolean}
 */
const connectToDatabase = async () => {
  const env = globConfig.NODE_ENV || 'development';
  const config = configJSON[env];
  const connection = mysql.createConnection({
    // host: '127.0.0.1',
    // user: 'root',
    // database: 'apinebolusole_122021',
    // password: '',
    host: config.host,
    user: config.username,
    database: config.database,
    password: config.password,

  });
  connection.connect((err) => {
    if (err) {
      logger.info(`Db Connection Failed ${err}`);
    } else {
      logger.info('Db Connection Successfully');
    }
  });
  return false;
};

module.exports = {
  connectToDatabase,
};
