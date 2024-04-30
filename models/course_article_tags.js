const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseArticleTags extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    
  }
  CourseArticleTags.init(
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
        is_deleted: {
          allowNull: true,
          defaultValue: 1,
          type: DataTypes.TINYINT(1),
        }
      },
      {
        sequelize,
        modelName: 'course_article_tags',
        timestamps: false,
      },
  );
  return CourseArticleTags;
};
