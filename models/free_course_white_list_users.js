const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FreeCourseWhiteListUsers extends Model {
    static associate(models) {
    }
  }
  FreeCourseWhiteListUsers.init(
      {                                                           
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        email: {
          type: DataTypes.TEXT,
        }
      },
      {
        sequelize,
        modelName: 'free_course_white_list_users',
        timestamps: false,
      },
  );
  return FreeCourseWhiteListUsers;
};
