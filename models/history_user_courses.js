const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HistoryUserCourses extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      // define association here
      this.belongsTo(models.users, {foreignKey: 'user_id', as: 'user'});
      this.belongsTo(models.courses, {foreignKey: 'course_id', as: 'courseData'});
    }
  }
  HistoryUserCourses.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        course_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        user_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        completed_md_ids: {
          type: DataTypes.TEXT,
        },
        completed_lec_ids: {
          type: DataTypes.TEXT,
        },
        current_md_id: {
          type: DataTypes.NUMBER,
          defaultValue: 0,
        },
        current_lec_id: {
          type: DataTypes.NUMBER,
          defaultValue: 0,
        },
        progress: {
          type: DataTypes.DOUBLE,
          defaultValue: 0,
        },
        completed_exam_ids: {
          type: DataTypes.TEXT,
        },
        course_status: {
          type: DataTypes.NUMBER,
          defaultValue: 0,
        },
        started_at: {
          type: DataTypes.DATE,
          defaultValue: null,
          allowNull: true
        },
        completed_at: {
          type: DataTypes.DATE,
          defaultValue: null,
          allowNull: true

        },
        exam_available_expiry_time: {
          type: DataTypes.DATE ,
          defaultValue: null,
          allowNull: true

        },
        last_watch_module: {
          type: DataTypes.NUMBER,
          defaultValue: 0,
        },
        last_watch_lecture: {
          type: DataTypes.NUMBER,
          defaultValue: 0,
        },
        last_watch_duration: {
          type: DataTypes.TEXT,
          defaultValue: 0,
        },
        purchased_amount: {
          type: DataTypes.DOUBLE,
          defaultValue: 0,
        },
        mct_price_at_purchase: {
          type: DataTypes.DOUBLE,
          defaultValue: 0,
        },
        reward_amount: {
          type: DataTypes.DOUBLE,
          defaultValue: 0,
        },
        total_reward_earned: {
          type: DataTypes.DOUBLE,
          defaultValue: 0,
        },
        created_at: {
          defaultValue: new Date(),
          type: DataTypes.DATE,
        },
        updated_at: {
          defaultValue: new Date(),
          type: DataTypes.DATE,
        },
        module_progress: {
          defaultValue: '',
          type: DataTypes.TEXT,
        },
        transaction_id: {
          type: DataTypes.TEXT,
          defaultValue: null,
          allowNull: true,
        },
        is_nft_minted: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
          allowNull: false
        },
        nft_data: {
          type: DataTypes.TEXT,
          get: function() {
            if(this.getDataValue('nft_data')) {
              return JSON.parse(this.getDataValue("nft_data"));
            } else {
              return {}
            }
          },
          set: function(value) {
            return this.setDataValue("nft_data", JSON.stringify(value));
          }
        },
      },
      {
        sequelize,
        modelName: 'history_user_courses',
        timestamps: false,
      },
  );
  return HistoryUserCourses;
};
