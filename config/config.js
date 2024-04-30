const envConfig = require('dotenv');
envConfig.config();
const config = require('../src/config/config');

module.exports = {
  'development1': {
    'username': 'root',
    'password': '',
    'database': 'apinebolusole_122021',
    'host': '127.0.0.1',
    'dialect': 'mysql',
  },
  'development': {
    'username': config.DBUSER,
    'password': config.DBPASS,
    'database': config.DBNAME,
    'host': config.DBHOST,
    'dialect': config.DBDIALECT,
    'logging': false,
  },
  'production': {
    'username': config.DBUSER,
    'password': config.DBPASS,
    'database': config.DBNAME,
    'host': config.DBHOST,
    'dialect': config.DBDIALECT,
  },
};
