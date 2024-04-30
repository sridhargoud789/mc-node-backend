const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseQuestions extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
  }
  CourseQuestions.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        course_id: {
          allowNull: false,
          type: DataTypes.BIGINT,
        },
        title: {
          allowNull: false,
          type: DataTypes.TEXT('long'),
        },
        description: {
          allowNull: false,
          type: DataTypes.TEXT('long'),
        },
        created_by: {
          allowNull: false,
          type: DataTypes.BIGINT,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
      },
      {
        sequelize,
        modelName: 'course_questions',
        timestamps: false,
      },
  );
  return CourseQuestions;
};
