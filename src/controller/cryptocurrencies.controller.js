const response = require('../helpers/response.helper');
const constants = require('../config/constants');
const coinService = require('../dbService/coin.services');
const tokenomicService = require('../dbService/tokenomics.services');
const {array} = require('joi');
/**
 * test request
 * @param {*} req request object = HTTP
 * @param {*} res response object = HTTP
 * @param {*} next next function = HTTP
 * @return {Object} response object
 */
const listCryptoCurrencies = async (req, res, next) => {
  try {
    return response.helper(
        res,
        true,
        'WELCOME',
        {},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

const bannerCryptoCurrencies = async (req, res, next) => {
  try {
    const data = await coinService.bannerCoinsData();
    return response.helper(
        res,
        true,
        '_SUCCESS',
        {cryptocurrencies: data},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

const userFavouritesCryptoList = async (req, res, next) => {
  try {
    return response.helper(
        res,
        true,
        'WELCOME',
        {},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

const listCryptoCurrenciCategory = async (req, res, next) => {
  try {
    let {search} = req.query;
    search = search.trim();
    const data = await coinService.coinCryptoData(search);
    return response.helper(
        res,
        true,
        '_SUCCESS',
        {categories: data},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

const markUnmarkCryptoAsFavourite = async (req, res, next) => {
  try {
    return response.helper(
        res,
        true,
        'WELCOME',
        {},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

const coinsCryptoId = async (req, res, next) => {
  try {
    const {cryptoId} = req.params;
    const data = await coinService.coinDetails(cryptoId);
    return response.helper(
        res,
        true,
        '_SUCCESS',
        {cryptocurrency: data},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

const cryptoCommunityDetails = async (req, res, next) => {
  try {
    const {cryptoId} = req.params;
    const data = await coinService.coinCommunityData(cryptoId);
    return response.helper(
        res,
        true,
        '_SUCCESS',
        {cryptocommunities: data},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

const cryptoExplorersDetails = async (req, res, next) => {
  try {
    const {cryptoId} = req.params;
    const data = await coinService.coinExplorerData(cryptoId);
    return response.helper(
        res,
        true,
        '_SUCCESS',
        {cryptoexplorers: data},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

const cryptoWalletsDetails = async (req, res, next) => {
  try {
    const {cryptoId} = req.params;
    const data = await coinService.coinWalletData(cryptoId);
    return response.helper(
        res,
        true,
        '_SUCCESS',
        {cryptowallets: data},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

const tokenomicCommunityDetails = async (req, res, next) => {
  try {
    const {cryptoId} = req.params;
    const data = await tokenomicService.tokenomicCommunityData(cryptoId);
    return response.helper(
        res,
        true,
        '_SUCCESS',
        {tokenomiccommunities: data},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

const tokenomicExplorersDetails = async (req, res, next) => {
  try {
    const {cryptoId} = req.params;
    const data = await tokenomicService.tokenomicExplorerData(cryptoId);

    return response.helper(
        res,
        true,
        '_SUCCESS',
        {tokenomicexplorers: data},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

const tokenomicWalletsDetails = async (req, res, next) => {
  try {
    const {cryptoId} = req.params;
    const data = await tokenomicService.tokenomicWalletData(cryptoId);

    return response.helper(
        res,
        true,
        '_SUCCESS',
        {tokenomicwallets: data},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

const topCryptoList = async (req, res, next) => {
  try {
    let {page, per_page} = req.query;
    if ((page && per_page) || (per_page)) {
      if (!page) {
        page = 1;
      }
    } else {
      const count = await coinService.totalCoins();
      per_page = count;
      page = 1;
    }
    page = Number(page);
    per_page = Number(per_page);
    const cryptosData = await coinService.topCryptoData(per_page, page);
    for (let i=0; i<cryptosData.length; i++) {
      const crypto = cryptosData[i];
      let marketCap = 0;
      let currentPrice = 0;
      let circulationSupply = 0;
      if (crypto.apicrypto) {
        currentPrice = parseFloat(crypto.apicrypto.cg_current_price);
        circulationSupply = parseFloat(crypto.apicrypto.cg_circulating_supply);
        marketCap = circulationSupply * currentPrice;
        if (marketCap == 0) {
          marketCap = parseFloat(crypto.apicrypto.cg_market_cap);
        }
        crypto.apicrypto.market_cap = marketCap.toString();
        const arr = [];
        const sparklines = await coinService.cryptoSparkLineData(crypto.api_crypto_id);
        sparklines.forEach((eachSpark) => {
          arr.push(eachSpark.cg_price);
        });
        crypto.apicrypto.sparklines = arr;
      }
      cryptosData[i] = crypto;
    }

    return response.helper(
        res,
        true,
        '_SUCCESS',
        {cryptosData},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

const topTokenomics = async (req, res, next) => {
  try {
    let {page, per_page} = req.query;
    if ((page && per_page) || (per_page)) {
      if (!page) {
        page = 1;
      }
    } else {
      const count = await coinService.totalCoins();
      per_page = count;
      page = 1;
    }
    page = Number(page);
    per_page = Number(per_page);
    const tokenomicsData = await coinService.getTokenomicsData(per_page, page);
    for (let i=0; i<tokenomicsData.length; i++) {
      const tokenimic = tokenomicsData[i];
      if (tokenimic.apicrypto) {
        const arr = [];
        const sparklines = await coinService.cryptoSparkLineData(tokenimic.api_crypto_id);
        sparklines.forEach((eachSpark) => {
          arr.push(eachSpark.cg_parice);
        });
        tokenimic.apicrypto.sparklines = arr;
      }
      tokenomicsData[i] = tokenimic;
    }

    return response.helper(
        res,
        true,
        '_SUCCESS',
        {tokenomics: tokenomicsData},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

const topCryptos = async (req, res, next) => {
  try {
    const {cryptoId} = req.params;
    const data = await coinService.topCryptoCoinData(cryptoId);
    if (!data) {
      return response.helper(res, false, 'TOP_CRYPTO_NOT_FOUND', {}, constants.responseStatus.NOT_FOUND);
    }
    if (data.apicrypto) {
      const arr = [];
      const sparklines = await await coinService.cryptoSparkLineData(data.api_crypto_id);
      sparklines.forEach((eachSparkline)=>{
        arr.push(eachSparkline.cg_price);
      });
      data.apicrypto.sparklines = arr;
    }
    return response.helper(
        res,
        true,
        '_SUCCESS',
        {cryptodetail: data},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

const topTokenomicsDetails = async (req, res, next) => {
  try {
    const {cryptoId} = req.params;
    const tokenomicsData = await coinService.tokenomicsData(cryptoId);

    if (tokenomicsData.apicrypto) {
      const arr = [];
      const sparklines = await coinService.cryptoSparkLineData(tokenomicsData.api_crypto_id);
      sparklines.forEach((each)=>{
        arr.push(each.cg_price);
      });
      tokenomicsData.apicrypto.sparklines = arr;
    }
    return response.helper(
        res,
        true,
        '_SUCCESS',
        {tokenomicdetail: tokenomicsData},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

const topCryptosWithSlugData = async (req, res, next) => {
  try {
    let {slugName} = req.params;
    slugName = slugName.trim();
    const cryptoDetails = await coinService.topCryptoWithSlugDetails(slugName);
    if (!cryptoDetails) {
      return response.helper(res, false, 'TOP_CRYPTO_NOT_FOUND', {}, 404);
    }
    if (cryptoDetails.apicrypto) {
      const arr = [];
      const sparklines = await coinService.cryptoSparkLineData(cryptoDetails.api_crypto_id);
      sparklines.forEach((each)=>{
        arr.push(each.cg_price);
      });
      cryptoDetails.apicrypto.sparklines = arr;
    }

    return response.helper(
        res,
        true,
        '_SUCCESS',
        {cryptoDetails},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

const topTokenomicsSlugData = async (req, res, next) => {
  try {
    let {slugName} = req.params;
    slugName = slugName.trim();
    const tokenomicDetails = await coinService.topTokenomicsWithSlugDetails(slugName);
    if (!tokenomicDetails) {
      return response.helper(res, false, 'TOP_CRYPTO_NOT_FOUND', {}, 404);
    }
    if (tokenomicDetails.apicrypto) {
      const arr = [];
      const sparklines = await coinService.cryptoSparkLineData(tokenomicDetails.api_crypto_id);
      sparklines.forEach((each)=>{
        arr.push(each.cg_price);
      });
      tokenomicDetails.apicrypto.sparklines = arr;
    }

    return response.helper(
        res,
        true,
        '_SUCCESS',
        {tokenomicdetails: tokenomicDetails},
        constants.responseStatus.SUCCESS,
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listCryptoCurrencies,
  bannerCryptoCurrencies,
  userFavouritesCryptoList,
  listCryptoCurrenciCategory,
  markUnmarkCryptoAsFavourite,
  coinsCryptoId,
  cryptoCommunityDetails,
  cryptoExplorersDetails,
  cryptoWalletsDetails,
  tokenomicCommunityDetails,
  tokenomicExplorersDetails,
  tokenomicWalletsDetails,
  topCryptoList,
  topTokenomics,
  topCryptos,
  topTokenomicsDetails,
  topCryptosWithSlugData,
  topTokenomicsSlugData,
};
