const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CoursesModules extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      this.hasMany(models.course_lectures, {foreignKey: 'module_id', as: 'courseLectures'});
      this.hasOne(models.course_modules_multi_languages, {foreignKey: 'module_id', as: 'moduleData'});
      this.belongsTo(models.courses, {foreignKey: 'course_id', as: 'courses'});
      this.hasOne(models.course_exams, {foreignKey: 'module_id', as: 'examData'});
    }
  }
  CoursesModules.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },

        name: {
          type: DataTypes.TEXT,
          defaultValue: '',
        },
        description: {
          type: DataTypes.TEXT('long'),
          defaultValue: '',
        },
        duration: {
          type: DataTypes.NUMBER,
          defaultValue: 0,
        },
        module_index: {
          type: DataTypes.NUMBER,
          defaultValue: 0,
        },
        course_id: {
          allowNull: true,
          type: DataTypes.BIGINT,
        },
        created_at: {
          defaultValue: new Date(),
          type: DataTypes.DATE,
        },
        updated_at: {
          defaultValue: new Date(),
          type: DataTypes.DATE,
        },
        percentage: {
          type: DataTypes.DOUBLE,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        modelName: 'course_modules',
        timestamps: false,
      },
  );
  return CoursesModules;
};
