const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class TokenHolders extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	TokenHolders.init(
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.BIGINT,
			},
			wallet: {
				allowNull: false,
				type: DataTypes.BIGINT,
			},
			amount: {
				allowNull: false,
				type: DataTypes.STRING,
			}
    	},
		{
			sequelize,
			modelName: 'token_holders',
			timestamps: false,
		}
	)
	return TokenHolders
}
