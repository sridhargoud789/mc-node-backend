const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExamQuestionsMultiLanguages extends Model {
    static associate(models) {
      this.belongsTo(models.exam_questions, {foreignKey: 'question_id', as: 'questionsData'});
    }
  }
  ExamQuestionsMultiLanguages.init(
      {                                                           
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        question_id: {
          type: DataTypes.BIGINT,
        },
        language_code: {
          type: DataTypes.TEXT
        },
        question: {
          type: DataTypes.TEXT,
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
        }
      },
      {
        sequelize,
        modelName: 'exam_questions_multi_languages',
        timestamps: false,
      },
  );
  return ExamQuestionsMultiLanguages;
};
