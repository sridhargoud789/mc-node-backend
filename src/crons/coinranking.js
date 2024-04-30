const cron = require('node-cron');
const axios = require('axios');
const logger = require('../config/logger.js');
const constantConfigs = require('../config/config');
const commonService = require('../dbService/common.service');

cron.schedule('*/5 * * * *', async () => {
  logger.info('Coin ranking cron for data fetch Called');
  try {
    const config = {
      method: 'get',
      url: 'https://api.coinranking.com/v2/coin/razxDUgYGNAdQ',
      headers: {
        'x-access-token': constantConfigs.COINRANKING_KEYS,
      },
    };
    const {data: {data: {coin: {price}}}} = await axios(config);
    await commonService.updateCoinValue({
      coin_symbol: 'eth',
    }, {
      coinranking: price,
    });
  } catch (err) {
    await commonService.updateCoinValue({
      coin_symbol: 'eth',
    }, {
      coinranking: 0,
    });
  }
  logger.info('Coin ranking cron End');
});
