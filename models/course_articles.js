const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseArticles extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    
  }
  CourseArticles.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
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
        slug_en: {
          allowNull: true,
          type: DataTypes.TEXT('long'),
        },
        slug_es: {
          allowNull: true,
          type: DataTypes.TEXT('long'),
        },
        level: {
          allowNull: true,
          type: DataTypes.BIGINT,
        },
        published_on: {
          allowNull: true,
          type: DataTypes.DATE
        },
        is_published: {
          allowNull: true,
          type: DataTypes.TINYINT(1),
        },
        updated_on: {
          allowNull: true,
          type: DataTypes.DATE
        },
        duration: {
          allowNull: true,
          type: DataTypes.TEXT('long'),
        },
        content_title_en: {
          allowNull: true,
          type: DataTypes.TEXT('long'),
        },
        content_title_es: {
          allowNull: true,
          type: DataTypes.TEXT('long'),
        },
        content_description_en: {
          allowNull: true,
          type: DataTypes.TEXT('long'),
        },
        content_description_es: {
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
        tag_ids: {
          allowNull: true,
          type: DataTypes.TEXT('long'),
        },
        created_on: {
          allowNull: false,
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
        is_deleted: {
          allowNull: true,
          defaultValue: 1,
          type: DataTypes.TINYINT(1),
        },
        related_article_ids: {
          allowNull: true,
          type: DataTypes.TEXT('long'),
        },
        created_by: {
          allowNull: false,
          type: DataTypes.BIGINT,
        },
        article_number:{
          allowNull: true,
          type: DataTypes.TEXT('long'),
        }
      },
      {
        sequelize,
        modelName: 'course_articles',
        timestamps: false,
      },
  );
  return CourseArticles;
};
