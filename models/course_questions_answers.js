const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class CourseQuestionAnswers extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
	}
	CourseQuestionAnswers.init(
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.BIGINT,
			},
			answer: {
				allowNull: true,
				type: DataTypes.TEXT('long'),
			},
			created_by: {
				allowNull: false,
				type: DataTypes.BIGINT,
			},
			created_at: {
				type: DataTypes.DATE,
				defaultValue: new Date(),
			},
			course_id: {
				allowNull: false,
				type: DataTypes.BIGINT,
			},
			title: {
				allowNull: false,
				type: DataTypes.TEXT('long'),
			},
			description: {
				allowNull: false,
				type: DataTypes.TEXT('long'),
			},
			answered_by: {
				allowNull: true,
				type: DataTypes.BIGINT,
			},
			answered_at: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			is_approved: {
				allowNull: true,
				type: DataTypes.TINYINT(1),
			},
			approved_by: {
				allowNull: true,
				type: DataTypes.BIGINT,
			},
			approved_at: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			lecture_id: {
				allowNull: false,
				type: DataTypes.BIGINT,
			},
			image_url: {
				allowNull: false,
				type: DataTypes.TEXT('long'),
			},
			is_deleted: {
				allowNull: true,
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
		},
		{
			sequelize,
			modelName: 'course_questions_answers',
			timestamps: false,
		}
	)
	return CourseQuestionAnswers
}
