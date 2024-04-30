const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExamQuestionsMappings extends Model {
    static associate(models) {
      this.belongsTo(models.course_exams, {foreignKey: 'exam_id', as: 'exam'});
      this.belongsTo(models.exam_questions, {foreignKey: 'question_id', as : 'questions'});
    }
  }
  ExamQuestionsMappings.init(
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
        question_id: {
          type: DataTypes.BIGINT,
        },
        shuffle_index: {
          type: DataTypes.NUMBER,
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
        modelName: 'exam_questions_mappings',
        timestamps: false,
      },
  );
  return ExamQuestionsMappings;
};
