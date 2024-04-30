const {Op} = require('sequelize');
const dbObj = require('../../models/index');
const noticeCategoryModel = dbObj.notice_categories;
const articleCategoryModel = dbObj.article_categories;
const statusModel = dbObj.statuses;
const coinValuesModel = dbObj.coin_values;
const userCourseMarketingDetailsModel = dbObj.user_course_marketing_details;

module.exports.noticeCategory = async () => {
  const data = await noticeCategoryModel.findAll({
    where: {
      deleted_at: null,
    },
    attributes: ['id', 'name', 'slug', 'language_id'],
    order: [['created_at', 'DESC']],
  });
  return data;
};

module.exports.articleCategory = async () => {
  const data = await articleCategoryModel.findAll({
    where: {
      deleted_at: null,
    },
    attributes: ['id', 'name', 'slug', 'language_id'],
    order: [['created_at', 'DESC']],
  });
  return data;
};

module.exports.statusDetails = async (code='PUB') => {
  return await statusModel.findOne({where: {code}, attributes: ['id', 'code', 'name']});
};

module.exports.updateCoinValue = async (condition, updateData) => {
  return await coinValuesModel.update(updateData, {
    where: condition,
  });
};

module.exports.calculateTokenAvg = async () => {
  return await coinValuesModel.findOne({
    where: {
      coin_symbol: 'mct',
    },
  });
};

module.exports.saveMarketingDetails = async (marketingData) => {
  return await userCourseMarketingDetailsModel.create(marketingData);
}

module.exports.discountCalculate