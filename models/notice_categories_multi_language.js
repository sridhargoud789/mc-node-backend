const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NoticeCategoriesMultiLanguage extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      this.belongsTo(models.notice_categories, {
        foreignKey: 'category_id',
        as: 'categoryData',
      });
    }
  }
  NoticeCategoriesMultiLanguage.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        category_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        slug: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        language_code: {
          type: "VARCHAR(10)",
          allowNull: false,
        }
      },
      {
        sequelize,
        modelName: 'notice_categories_multi_languages',
        timestamps: false,
      },
  );
  return NoticeCategoriesMultiLanguage;
};
