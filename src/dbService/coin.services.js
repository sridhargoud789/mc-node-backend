const {Op} = require('sequelize');
const {sequelize} = require('../../models/index');
const dbObj = require('../../models/index');
const apiCryptosModel = dbObj.api_cryptos;
const apiSparklineCryptosModel = dbObj.api_sparkline_cryptos;
const apiCategoryCryptosModel = dbObj.api_category_cryptos;
const cryptoModel = dbObj.cryptos;
const cryptoWalletModel = dbObj.crypto_wallets;
const cryptoExplorerModel = dbObj.crypto_explorers;
const cryptoCommunityModel = dbObj.crypto_communities;
const tagModel = dbObj.tags;
const languageModel = dbObj.languages;
const tokenomicModel = dbObj.tokenomics;
const tokenomicDetailsModel = dbObj.tokenomic_details;
const tokenomicWalletModel = dbObj.tokenomic_wallet;
const tokenomicExplorerModel = dbObj.tokenomic_explorer;
const tokenomicCommunyModel = dbObj.tokenomic_communities;
const categoryModel = dbObj.categories;

module.exports.apiCryptoCurrenciesData = async (searchName) => {
  const data = await apiCryptosModel.findAll({
    where: {
      cg_name: {
        [Op.like]: `%${searchName}%`,
      },
    },
    include: [
      {
        model: apiSparklineCryptosModel,
        attributes: ['api_crypto_id', 'cg_price'],
        as: 'sparklinein7d',
      },
    ],
  });
  return data;
};

module.exports.bannerCoinsData = async () => {
  const data = await apiCryptosModel.findAll({
    where: {
      banner: 1,
    },
    include: [
      {
        model: apiSparklineCryptosModel,
        attributes: ['api_crypto_id', 'cg_price'],
        as: 'sparklinein7d',
      },
    ],
    order: [['order', 'ASC']],
  });
  return data;
};

module.exports.coinCryptoData = async (searchName) => {
  const data = await apiCategoryCryptosModel.findAll({
    where: {
      cg_name: {
        [Op.like]: `%${searchName}%`,
      },
    },
    order: [['cg_name', 'ASC']],
  });
  return data;
};

module.exports.coinDetails = async (cryptoId) => {
  const data = await apiCryptosModel.findAll({
    where: {
      id: cryptoId,
    },
    include: [
      {
        model: apiSparklineCryptosModel,
        attributes: ['api_crypto_id', 'cg_price'],
        as: 'sparklinein7d',
      },
      {
        model: cryptoModel,
        as: 'infocrypto',
        include: [
          {
            model: cryptoWalletModel,
            as: 'wallet',
          },
          {
            model: cryptoExplorerModel,
            as: 'explorer',
          },
          {
            model: cryptoCommunityModel,
            as: 'community',
          },
        ],
      },
    ],
  });
  return data;
};

module.exports.coinCommunityData = async (cryptoId) => {
  const data = await cryptoCommunityModel.findAll({
    where: {
      id: cryptoId,
    },
  });
  return data;
};

module.exports.coinExplorerData = async (cryptoId) => {
  const data = await cryptoExplorerModel.findAll({
    where: {
      id: cryptoId,
    },
  });
  return data;
};

module.exports.coinWalletData = async (cryptoId) => {
  const data = await cryptoWalletModel.findAll({
    where: {
      id: cryptoId,
    },
  });
  return data;
};

module.exports.totalCoins = async () => {
  const data = await cryptoModel.findAll({
    where: {},
  });
  return data.length;
};

module.exports.topCryptoData = async (per_page, page = 1) => {
  const data = await cryptoModel.findAll({
    where: {
      active: 1,
    },
    include: [
      {
        model: apiCryptosModel,
        as: 'apicrypto',
      },
      {
        model: tagModel,
        as: 'tag',
      },
      {
        model: cryptoWalletModel,
        as: 'wallet',
      },
      {
        model: cryptoExplorerModel,
        as: 'explorer',
      },
      {
        model: cryptoCommunityModel,
        as: 'community',
      },
    ],
    order: [['order', 'ASC']],
    offset: (page - 1) * per_page,
    limit: per_page,
  });
  return data;
};
module.exports.cryptoSparkLineData = async (apiCryptoId) => {
  const data = await apiSparklineCryptosModel.findAll({
    where: {
      api_crypto_id: apiCryptoId,
    },
  });
  return data;
};

module.exports.getTokenomicsData = async (per_page, page = 1) => {
  const data = await tokenomicModel.findAll({
    where: {
      active: 1,
    },
    attributes: [
      'id',
      'name',
      'order',
      'active',
      'slug',
      'url_crypto',
      'description',
      'api_crypto_id',
      'crypto_id',
      'language_id',
      [sequelize.fn('TO_BASE64', sequelize.col('image')), 'image'],
      [sequelize.fn('TO_BASE64', sequelize.col('wallpaper')), 'wallpaper'],
      'created_at',
      'updated_at',

    ],
    include: [
      {
        model: cryptoModel,
        as: 'cryptos',
      },
    ],
    order: [['order', 'ASC']],
    offset: (page - 1) * per_page,
    limit: per_page,
  });
  return data;
};

module.exports.topCryptoCoinData = async (cryptoId) => {
  const data = await cryptoModel.findOne({
    where: {
      id: cryptoId,
    },
    include: [
      {
        model: apiCryptosModel,
        as: 'apicrypto',
      },
      {
        model: tagModel,
        as: 'tag',
      },
      {
        model: cryptoWalletModel,
        as: 'wallet',
      },
      {
        model: cryptoExplorerModel,
        as: 'explorer',
      },
      {
        model: cryptoCommunityModel,
        as: 'community',
      },
    ],
  });
  return data;
};

module.exports.tokenomicsData = async (per_page, page = 1) => {
  const data = await tokenomicModel.findOne({
    where: {
      active: 1,
    },
    attributes: [
      'id',
      'name',
      'order',
      'active',
      'slug',
      'url_crypto',
      'description',
      'api_crypto_id',
      'crypto_id',
      'language_id',
      [sequelize.fn('TO_BASE64', sequelize.col('image')), 'image'],
      [sequelize.fn('TO_BASE64', sequelize.col('wallpaper')), 'wallpaper'],
      'created_at',
      'updated_at',

    ],
    include: [
      {
        model: apiCryptosModel,
        as: 'apicrypto',
      },
      {
        model: tokenomicDetailsModel,
        as: 'detail',
      },
      {
        model: tokenomicWalletModel,
        as: 'wallet',
      },
      {
        model: tokenomicExplorerModel,
        as: 'explorer',
      },
      {
        model: tokenomicCommunyModel,
        as: 'community',
      },
    ],
  });
  return data;
};

module.exports.topCryptoWithSlugDetails = async (slug) => {
  const data = await cryptoModel.findOne({
    where: {
      slug: {
        [Op.like]: `%${slug}%`,
      },
    },
    include: [
      {
        model: apiCryptosModel,
        as: 'apicrypto',
      },
      {
        model: tagModel,
        as: 'tag',
      },
      {
        model: cryptoWalletModel,
        as: 'wallet',
      },
      {
        model: cryptoExplorerModel,
        as: 'explorer',
      },
      {
        model: cryptoCommunityModel,
        as: 'community',
      },
    ],
  });
  return data;
};

module.exports.topTokenomicsWithSlugDetails = async (slug) => {
  const data = await tokenomicModel.findOne({
    where: {
      slug: {
        [Op.like]: `%${slug}%`,
      },
    },
    attributes: [
      'id',
      'name',
      'order',
      'active',
      'slug',
      'url_crypto',
      'description',
      'api_crypto_id',
      'crypto_id',
      'language_id',
      [sequelize.fn('TO_BASE64', sequelize.col('image')), 'image'],
      [sequelize.fn('TO_BASE64', sequelize.col('wallpaper')), 'wallpaper'],
      'created_at',
      'updated_at',

    ],
    include: [
      {
        model: apiCryptosModel,
        as: 'apicrypto',
      },
      {
        model: tokenomicDetailsModel,
        as: 'detail',
      },
      {
        model: tokenomicWalletModel,
        as: 'wallet',
      },
      {
        model: tokenomicExplorerModel,
        as: 'explorer',
      },
      {
        model: tokenomicCommunyModel,
        as: 'community',
      },
    ],
  });
  return data;
};

module.exports.slugCryptoList = async () => {
  const data = await apiCryptosModel.findAll({
    attributes: ['slug'],
  });
  return data;
};

module.exports.categoryListData = async () => {
  const data = await categoryModel.findAll({});
  return data;
};
