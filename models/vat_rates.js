const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class Vat_rates extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
	}
	Vat_rates.init(
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.BIGINT,
			},
			name: {
				allowNull: false,
				type: DataTypes.TEXT('long'),
			},
			code: {
				allowNull: false,
				type: DataTypes.TEXT('long'),
			},
			percentage: {
				allowNull: false,
				type: DataTypes.DOUBLE,
			},
		},
		{
			sequelize,
			modelName: 'vat_rates',
			timestamps: false,
		}
	)
	return Vat_rates
}
