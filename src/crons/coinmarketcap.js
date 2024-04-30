const cron = require('node-cron');
const axios = require('axios');
const logger = require('../config/logger.js');
const config = require('../config/config');
const commonService = require('../dbService/common.service');

cron.schedule(config.COINMARKETCAP_CRON_TIME, async () => {
  logger.info('Coinmarket cap cron for data fetch Called');
  try {
    const axiosConfig = {
      method: 'get',
      url: 'https://pro-api.coinmarketcap.com/v2/tools/price-conversion?id=21542&amount=1',
      headers: {
        'X-CMC_PRO_API_KEY': config.COINMARKETCAP_KEYS,
      },
    };
    const {
      data: {
        data: {
          quote: {
            USD: {price},
          },
        },
      },
    } = await axios(axiosConfig);
    logger.info(`price will be ${price}`);
    await commonService.updateCoinValue(
        {
          coin_symbol: 'mct',
        },
        {
          coinmarketcap: price,
        },
    );
  } catch (err) {
    await commonService.updateCoinValue(
        {
          coin_symbol: 'mct',
        },
        {
          coinmarketcap: 0,
        },
    );
  }
  logger.info('Coinmarketcap cron End');
});
