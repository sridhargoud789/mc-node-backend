const cron = require('node-cron');
const logger = require('../config/logger.js');
const axios = require('axios');

cron.schedule('*/5 * * * *', async () => {
  logger.info('Coin ranking cron for data fetch Called');
  logger.info('Coin ranking cron End');
});
