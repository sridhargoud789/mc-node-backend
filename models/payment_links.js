const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class Payment_links extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
	}
	Payment_links.init(
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.BIGINT,
			},
			course_id: { allowNull: false, type: DataTypes.BIGINT },
			sales_agent_code: {
				allowNull: false,
				type: DataTypes.TEXT(),
			},
			link: {
				allowNull: false,
				type: DataTypes.TEXT(),
			},
		},
		{
			sequelize,
			modelName: 'payment_links',
			timestamps: false,
		}
	)
	return Payment_links
}
