const cron = require('node-cron');
const logger = require('../config/logger.js');


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
      coingeco: price,
    });
  } catch (err) {
    await commonService.updateCoinValue({
      coin_symbol: 'eth',
    }, {
      coingeco: 0,
    });
  }
  logger.info('Coin ranking cron End');
});
