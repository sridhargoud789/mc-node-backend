const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExamQuestions extends Model {
    static associate(models) {
      this.belongsTo(models.course_exams, {foreignKey: 'exam_id', as: 'exam'});
      this.hasOne(models.exam_questions_multi_languages, {foreignKey: 'question_id', as: 'questionData'})
    }
  }
  ExamQuestions.init(
      {                                                           
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        exam_id: {
          type: DataTypes.BIGINT,
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
        },
        correct_answer: {
          type: DataTypes.TEXT,
        },
        created_at: {
          defaultValue: new Date(),
          type: DataTypes.DATE,
        },
        updated_at: {
          defaultValue: new Date(),
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
        modelName: 'exam_questions',
        timestamps: false,
      },
  );
  return ExamQuestions;
};
