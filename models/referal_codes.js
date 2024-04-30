const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class ReferralCodes extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.users, { foreignKey: 'user_id', as: 'user' })
			this.belongsTo(models.courses, {
				foreignKey: 'course_id',
				as: 'courseData',
			})
		}
	}
	ReferralCodes.init(
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
			code: {
				allowNull: false,
				type: DataTypes.STRING,
			},
			discount_percentage: {
				type: DataTypes.DOUBLE,
			},
			course_id: {
				type: DataTypes.BIGINT,
				defaultValue: null,
			},
			available_for_partial_payments: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
			stripe_discount_id: {
				type: DataTypes.STRING,
				defaultValue: null,
			},
			is_active: {
				type: DataTypes.TINYINT(1),
				defaultValue: 1,
			},
		},
		{
			sequelize,
			modelName: 'referral_codes',
			timestamps: false,
		}
	)
	return ReferralCodes
}
