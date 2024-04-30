const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserQueAnswers extends Model {
    static associate(models) {
      this.belongsTo(models.users, {foreignKey: 'user_id'});
    }
  }
  UserQueAnswers.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        exam_id: {
          allowNull: false,
          type: DataTypes.BIGINT,
        },
        user_id: {
          allowNull: false,
          type: DataTypes.BIGINT,
        },
        question_id: {
          allowNull: false,
          type: DataTypes.BIGINT,
        },
        question: {
          type: DataTypes.TEXT('long'),
          defaultValue: '',
        },
        option1: {
          type: DataTypes.TEXT,
          default: null
        },
        option2: {
          type: DataTypes.TEXT,
          default: null
        },
        option3: {
          type: DataTypes.TEXT,
          default: null
        },
        option4: {
          type: DataTypes.TEXT,
          default: null
        },
        correct_answer: {
          type: DataTypes.TEXT,
          defaultValue: '',
        },
        user_answer: {
          type: DataTypes.TEXT,
          defaultValue: '',
        },
        is_correct: {
          type: DataTypes.TINYINT,
          defaultValue: 0,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
      },
      {
        sequelize,
        modelName: 'user_que_answers',
        timestamps: false,
      },
  );
  return UserQueAnswers;
};
