const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HistoryUserExams extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      // define association here
      this.belongsTo(models.users, {foreignKey: 'user_id', as: 'user'});
      this.belongsTo(models.course_exams, {foreignKey: 'exam_id', as: 'examData'});
    }
  }
  HistoryUserExams.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        user_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        exam_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        start_time: {
          type: DataTypes.DATE,
        },
        completed_time: {
          type: DataTypes.DATE,
        },
        // exam reward from total reward of course
        exam_reward: {
          type: DataTypes.DOUBLE,
          defaultValue: 0,  
        },
        // user obtained reward point from total reward 
        reword_points: {
          type: DataTypes.NUMBER,
          defaultValue: 0,
        },
        is_point_collected: {
          type: DataTypes.TINYINT(1),
          allowNull: false,
          defaultValue: 0,
        },
        is_passed: {
          type: DataTypes.TINYINT(1),
          allowNull: false,
          defaultValue: 0,
        },
        is_request_to_collect: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
          allowNull: false,
        },
        percentage: {
          type: DataTypes.DOUBLE,
          defaultValue: 0,
        },
        request_time_to_collect: {
          type: DataTypes.DATE,
          defaultValue: null
        },
        reward_with: {
          type: DataTypes.STRING(20),
          values: ['mc_wallet', 'mct']
        },
        reward_in: {
          type: DataTypes.STRING(20),
          values: ['mct', 'doller']
        }
      },
      {
        sequelize,
        modelName: 'history_user_exams',
        timestamps: false,
      },
  );
  return HistoryUserExams;
};
