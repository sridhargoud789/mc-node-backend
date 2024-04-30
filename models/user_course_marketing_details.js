const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class UserCourseMarketingDetails extends Model {
		static associate(models) {
			this.belongsTo(models.users, { foreignKey: 'user_id' })
			this.belongsTo(models.courses, { foreignKey: 'course_id' })
		}
	}
	UserCourseMarketingDetails.init(
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.BIGINT,
			},
			user_id: {
				allowNull: true,
				type: DataTypes.BIGINT,
			},
			course_id: {
				type: DataTypes.BIGINT,
				allowNull: true,
			},
			name: {
				type: DataTypes.STRING,
				defaultValue: '',
			},
			email: {
				type: DataTypes.STRING,
				defaultValue: '',
			},
			phone_number: {
				type: DataTypes.STRING,
				defaultValue: '',
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
			modelName: 'user_course_marketing_details',
			timestamps: false,
		}
	)
	return UserCourseMarketingDetails
}
