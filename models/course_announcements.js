const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseAnnouncements extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    
  }
  CourseAnnouncements.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        created_by: {
          allowNull: false,
          type: DataTypes.BIGINT,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: new Date(),
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
      },
      {
        sequelize,
        modelName: 'course_announcements',
        timestamps: false,
      },
  );
  return CourseAnnouncements;
};
