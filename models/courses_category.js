const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseCategory extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      this.belongsTo(models.courses, {foreignKey: 'course_id', as: 'course'});
      this.belongsTo(models.notice_categories, {foreignKey: 'category_id', as: 'category'});
      this.belongsTo(models.languages, {foreignKey: 'language_id', as: 'language'});
    }
  }
  CourseCategory.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        course_id: {
          allowNull: true,
          type: DataTypes.BIGINT,
        },
        category_id: {
          allowNull: true,
          type: DataTypes.BIGINT,
        },
        language_id: {
          allowNull: true,
          type: DataTypes.BIGINT,
        },
        created_at: {
          defaultValue: new Date(),
          type: DataTypes.DATE,
        },
        updated_at: {
          defaultValue: new Date(),
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
        modelName: 'course_categories',
        timestamps: false,
      },
  );
  return CourseCategory;
};
