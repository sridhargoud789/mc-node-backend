const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class CoursesUsers extends Model {
		static associate(models) {
			this.belongsTo(models.courses, {
				foreignKey: 'course_id',
				as: 'course',
			})
			this.belongsTo(models.users, {
				foreignKey: 'user_id',
				as: 'users',
			})

			this.belongsTo(models.notice_categories, {
				foreignKey: 'category_id',
				as: 'category',
			})
			this.belongsTo(models.languages, {
				foreignKey: 'language_id',
				as: 'language',
			})
			this.belongsTo(models.users_addresses, {
				foreignKey: 'address_id',
				as: 'addressData',
			})
			this.belongsTo(models.course_packages, {
				foreignKey: 'package_id',
				as: 'packageData',
			})
			this.belongsTo(models.discounts, {
				foreignKey: 'discount_id',
				as: 'discountData',
			})
			this.belongsTo(models.users, {
				foreignKey: 'referal_user_id',
				as: 'referalUserData',
			})
			this.belongsTo(models.referral_codes, {
				foreignKey: 'referral_code',
				as: 'referralDetails',
			})
		}
	}
	CoursesUsers.init(
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.BIGINT,
			},
			course_id: {
				allowNull: true,
				type: DataTypes.BIGINT,
			},
			package_id: {
				type: DataTypes.BIGINT,
				allowNull: true,
			},
			discount_id: {
				type: DataTypes.BIGINT,
				allowNull: true,
			},
			user_id: {
				allowNull: true,
				type: DataTypes.BIGINT,
			},
			coinbase_id: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
			paypal_id: {
				allowNull: true,
				type: DataTypes.BIGINT,
			},
			stripe_id: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			transaction_id: {
				allowNull: true,
				type: DataTypes.STRING,
				defaultValue: '',
			},
			wallet_pay_id: {
				allowNull: true,
				defaultValue: '',
				type: DataTypes.STRING,
			},
			status: {
				allowNull: true,
				type: DataTypes.NUMBER,
				defaultValue: 0,
			},
			address_id: {
				type: DataTypes.BIGINT,
			},
			referal_user_id: {
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
			is_discount_used: {
				type: DataTypes.TINYINT(1),
				allowNull: false,
				defaultValue: 0,
			},
			used_discount_id: {
				type: DataTypes.BIGINT,
				defaultValue: null,
			},
			is_partial_payment: {
				type: DataTypes.TINYINT(1),
				defaultValue: false,
			},
			payment_devied_in: {
				type: DataTypes.NUMBER,
				defaultValue: 0,
			},
			remian_payments: {
				type: DataTypes.NUMBER,
				defaultValue: 0,
			},
			next_payment_date: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			each_payment_amount: {
				type: DataTypes.NUMBER,
				defaultValue: 0,
			},
			referral_code: {
				type: DataTypes.BIGINT,
				defaultValue: null,
			},
			is_mct_discount: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
			user_ip: {
				type: DataTypes.TEXT,
				defaultValue: '',
			},
			mc_amount: {
				type: DataTypes.DOUBLE,
				defaultValue: 0,
			},
			mct_price: {
				type: DataTypes.DOUBLE,
				defaultValue: 0,
			},
			is_remainder_notifications_enabled: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
			is_first_remainder_sent: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
			is_second_remainder_sent: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
			is_third_remainder_sent: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
			is_fourth_remainder_sent: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
			purchase_amount_usd: {
				type: DataTypes.DOUBLE,
				defaultValue: 0,
			},
			next_payment_stripe_id: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			payment_details: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			sales_agent: {
				type: DataTypes.BIGINT,
				defaultValue: null,
			},
			telegram_username_submitted: {
				type: DataTypes.TINYINT(1),
				defaultValue: null,
			},
		},
		{
			sequelize,
			modelName: 'courses_users',
			timestamps: false,
		}
	)
	return CoursesUsers
}
