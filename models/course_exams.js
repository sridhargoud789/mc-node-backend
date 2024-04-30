const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class CourseExams extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			this.belongsTo(models.courses, {
				foreignKey: 'course_id',
				as: 'courses',
			})
			this.belongsTo(models.course_modules, {
				foreignKey: 'module_id',
				as: 'courseModules',
			})
			this.hasMany(models.exam_questions, {
				foreignKey: 'exam_id',
				as: 'questions',
			})
			this.hasMany(models.exam_questions_mappings, {
				foreignKey: 'exam_id',
				as: 'shuffleQuestions',
			})
			this.hasOne(models.course_exams_multi_languages, {
				foreignKey: 'exam_id',
				as: 'examData',
			})
		}
	}
	CourseExams.init(
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.BIGINT,
			},
			name: {
				type: DataTypes.TEXT('long'),
			},
			instruction: {
				type: DataTypes.TEXT('long'),
			},
			duration: {
				type: DataTypes.TEXT,
			},
			reward: {
				type: DataTypes.DOUBLE,
			},
			course_id: {
				type: DataTypes.BIGINT,
			},
			module_id: {
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
			is_disabled: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
		},
		{
			sequelize,
			modelName: 'course_exams',
			timestamps: false,
		}
	)
	return CourseExams
}
