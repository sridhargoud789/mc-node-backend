const { Model } = require('sequelize')
const AWS = require('aws-sdk')
const config = require('../src/config/config')

module.exports = (sequelize, DataTypes) => {
	class NftPurchases extends Model {
        static associate(models) {
            this.belongsTo(models.users, {foreignKey: 'user_id', as: 'user'});
            this.belongsTo(models.courses, {foreignKey: 'course_id', as: 'courseData'});
			this.belongsTo(models.users_addresses, {foreignKey: 'address_id', as:'shippingAddressData'})
          }
    }
	NftPurchases.init(
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.BIGINT,
			},
			user_id: {
				allowNull: false,
				type: DataTypes.BIGINT,
			},
            course_id: {
				allowNull: false,
				type: DataTypes.BIGINT,
			},
            transaction_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            purchase_with: {
                type: DataTypes.STRING,
                defaultValue: '',
                allowNull: false,
            },
			amount: {
				type: DataTypes.BIGINT,
				defaultValue: 0
			},
			status: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0
			},
			mct_price_at_purchase: {
				type: DataTypes.DOUBLE,
				defaultValue: 0,	
			},
			address_id: {
				type: DataTypes.BIGINT,
			},
			created_at: {
				type: DataTypes.DATE,
				defaultValue: new Date()
			},
			updated_at: {
				type: DataTypes.DATE,
				defaultValue: new Date()
			}
		},
		{
			sequelize,
			modelName: 'nft_purchases',
			timestamps: false,
		}
	)
	return NftPurchases
}
