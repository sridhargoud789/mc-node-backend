const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseExamsMultiLanguages extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      this.belongsTo(models.course_exams, {foreignKey: 'exam_id', as: 'examData'});
    }
  }
  CourseExamsMultiLanguages.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        exam_id: {
          type: DataTypes.BIGINT,
        },
        language_code: {
          type: DataTypes.TEXT
        },
        name: {
          type: DataTypes.TEXT('long'),
        },
        instruction: {
          type: DataTypes.TEXT('long'),
        },
      },
      {
        sequelize,
        modelName: 'course_exams_multi_languages',
        timestamps: false,
      },
  );
  return CourseExamsMultiLanguages;
};
