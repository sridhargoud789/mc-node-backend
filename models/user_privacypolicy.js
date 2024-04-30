const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UsersPrivacyPolicies extends Model {
    static associate(models) {
      this.belongsTo(models.users, {foreignKey: 'user_id'});
    }
  }
  UsersPrivacyPolicies.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },
        level: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        is_show_search_engine: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        is_show_tracking_course: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        is_profile_public: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },

        show_currently_learning: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        show_completed_learning: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        show_interest: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },

        user_id: {
          type: DataTypes.BIGINT,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
      },
      {
        sequelize,
        modelName: 'user_privacy_policies',
        timestamps: false,
      },
  );
  return UsersPrivacyPolicies;
};
