const { Model } = require('sequelize')
const AWS = require('aws-sdk')
const config = require('../src/config/config')

module.exports = (sequelize, DataTypes) => {
	class Discounts extends Model {}
	Discounts.init(
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.BIGINT,
			},
			name: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
			discount_amount: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
			stripe_coupon_id: {
				type: DataTypes.TEXT,
			},
			stripe_product_id: {
				type: DataTypes.TEXT,
			},
			stripe_price_id: {
				type: DataTypes.TEXT,	
			},
			is_active: {
				type: DataTypes.TINYINT(1),
				allowNull: false,
				defaultValue: 0,
			},
			for_all_package: {
				type: DataTypes.TINYINT(1),
				allowNull: false,
				defaultValue: 0,
			},
			for_all_courses: {
				type: DataTypes.TINYINT(1),
				allowNull: false,
				defaultValue: 0,
			},
			package_list: {
				type: DataTypes.TEXT,
				defaultValue: null
			},
			course_list: {
				type: DataTypes.TEXT,
				defaultValue: null
			},
			created_at: {
				type: DataTypes.DATE,
				defaultValue: new Date()
			}
		},
		{
			sequelize,
			modelName: 'discounts',
			timestamps: false,
		}
	)
	return Discounts
}
