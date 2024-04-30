const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UsersNotifications extends Model {
    static associate(models) {
      this.belongsTo(models.users, {foreignKey: 'user_id'});
    }
  }
  UsersNotifications.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },
        unusul_activity: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        new_signin: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        sales_news: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },

        features_updates: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        account_tips: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        course_update: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },


        course_teacher_discussion: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        course_personalized_rec: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },

        course_featured_content: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        course_product_update: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        course_event_offer_update: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },

        user_id: {
          type: DataTypes.BIGINT,
        },
      },
      {
        sequelize,
        modelName: 'users_notifications',
        timestamps: false,
      },
  );
  return UsersNotifications;
};
