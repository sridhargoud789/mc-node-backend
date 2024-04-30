const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserExamReports extends Model {
    static associate(models) {
      this.belongsTo(models.users, {foreignKey: 'user_id', as : 'userData'});
      this.belongsTo(models.courses, {foreignKey: 'course_id', as : 'courseData'});
      this.belongsTo(models.course_modules, {foreignKey: 'module_id', as : 'courseModulesData'});
      this.belongsTo(models.course_exams, {foreignKey: 'exam_id', as : 'examData'});
    
    }
  }
  UserExamReports.init(
      {
      id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },

        user_id: {
          type: DataTypes.BIGINT,
        },
        course_id: {
          type: DataTypes.BIGINT,
        },
        module_id: {
          type: DataTypes.BIGINT,
        },
        exam_id: {
          type: DataTypes.BIGINT,
        },
        report_data: {
          type: DataTypes.TEXT,
          get: function() {
            return JSON.parse(this.getDataValue("report_data"));
          },
          set: function(value) {
            return this.setDataValue("report_data", JSON.stringify(value));
          }
        },
        report_shared_url: {
          type: DataTypes.TEXT
        },
        ci_socre: {
          type: DataTypes.TEXT,
        },
        ci_index: {
          type: DataTypes.TEXT,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
      },
      {
        sequelize,
        modelName: 'user_exam_reports',
        timestamps: false,
      },
  );
  return UserExamReports;
};
