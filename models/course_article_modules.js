const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseArticleModules extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    
  }
  CourseArticleModules.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        article_id: {
          allowNull: false,
          type: DataTypes.BIGINT,
        },
        title_en: {
          allowNull: true,
          type: DataTypes.TEXT('long'),
        },
        title_es: {
          allowNull: true,
          type: DataTypes.TEXT('long'),
        },
        sub_title_en: {
          allowNull: true,
          type: DataTypes.TEXT('long'),
        },
        sub_title_es: {
          allowNull: true,
          type: DataTypes.TEXT('long'),
        },
        content_en: {
          allowNull: true,
          type: DataTypes.TEXT('long'),
        },
        content_es: {
          allowNull: true,
          type: DataTypes.TEXT('long'),
        },
        image_url_en: {
          allowNull: true,
          type: DataTypes.TEXT('long'),
        },
        image_url_es: {
          allowNull: true,
          type: DataTypes.TEXT('long'),
        },
        created_on: {
          allowNull: false,
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
        created_by: {
          allowNull: false,
          type: DataTypes.BIGINT,
        },
        updated_on: {
          allowNull: false,
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
        is_deleted: {
          allowNull: true,
          defaultValue: 1,
          type: DataTypes.TINYINT(1),
        },
      },
      {
        sequelize,
        modelName: 'course_article_modules',
        timestamps: false,
      },
  );
  return CourseArticleModules;
};
