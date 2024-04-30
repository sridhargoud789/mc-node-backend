const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseAnnouncementComments extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
  }
  CourseAnnouncementComments.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        announcement_id: {
          allowNull: false,
          type: DataTypes.BIGINT,
        },
        comments: {
          allowNull: false,
          type: DataTypes.TEXT('long'),
        },
        comments_by: {
          allowNull: false,
          type: DataTypes.TINYINT(1),
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
        modelName: 'course_announcements_comments',
        timestamps: false,
      },
  );
  return CourseAnnouncementComments;
};
