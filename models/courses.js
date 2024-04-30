const { Model } = require('sequelize')
const AWS = require('aws-sdk')
const config = require('../src/config/config')
const awsHelper = require('../src/helpers/aws.helper')
const AWSS3Bucket = config.MS_TUTORIAL_BUCKET
const s3 = new AWS.S3()

AWS.config.update({
	signatureVersion: 'v4',
	accessKeyId: config.AWS_ACCESS_KEY,
	secretAccessKey: config.AWS_SECRET_KEY,
})
const signedUrlExpireSeconds = 60 * 5

module.exports = (sequelize, DataTypes) => {
	class Courses extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			this.belongsTo(models.users, {
				foreignKey: 'author_id',
				as: 'author',
			})
			this.hasOne(models.courses_multi_language, {
				foreignKey: 'course_id',
				as: 'courseData',
			})
			this.belongsTo(models.levels, {
				foreignKey: 'level_id',
				as: 'levels',
			})
			this.hasMany(models.course_categories, {
				foreignKey: 'course_id',
				as: 'courseCategories',
			})
			this.belongsTo(models.languages, {
				foreignKey: 'language_id',
				as: 'language',
			})
			this.hasOne(models.course_for, {
				foreignKey: 'course_id',
				as: 'courseFor',
			})
			this.hasMany(models.course_modules, {
				foreignKey: 'course_id',
				as: 'courseModules',
			})
			this.hasMany(models.course_lectures, {
				foreignKey: '',
				as: 'courseLectures',
			})
			this.belongsTo(models.statuses, {
				foreignKey: 'status_id',
				as: 'status',
			})
		}
	}
	Courses.init(
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
			sub_title: {
				allowNull: true,
				type: DataTypes.TEXT('long'),
			},
			features_list: {
				type: DataTypes.TEXT('long'),
			},
			learning_points: {
				type: DataTypes.TEXT('long'),
			},
			slug: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			description: {
				allowNull: true,
				type: DataTypes.TEXT('long'),
			},
			url_image: {
				allowNull: true,
				type: DataTypes.TEXT('long'),
			},
			url_image_mobile: {
				allowNull: true,
				type: DataTypes.TEXT('long'),
			},
			url_image_thumbnail: {
				allowNull: true,
				type: DataTypes.TEXT('long'),
			},
			thumbnail_video: {
				type: DataTypes.TEXT('long'),
			},
			duration: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
			price: {
				allowNull: true,
				type: DataTypes.DOUBLE,
			},
			mct_amount: {
				allowNull: false,
				defaultValue: 0,
				type: DataTypes.DOUBLE,
			},
			reword: {
				type: DataTypes.DOUBLE,
				allowNull: false,
			},
			author_id: {
				allowNull: true,
				type: DataTypes.BIGINT,
			},
			status_id: {
				allowNull: true,
				type: DataTypes.BIGINT,
			},
			level_id: {
				allowNull: true,
				type: DataTypes.BIGINT,
			},
			language_id: {
				allowNull: true,
				type: DataTypes.BIGINT,
			},
			is_published: {
				type: DataTypes.BOOLEAN,
				defaultValue: 0,
			},
			created_at: {
				defaultValue: new Date(),
				type: DataTypes.DATE,
			},
			updated_at: {
				defaultValue: new Date(),
				type: DataTypes.DATE,
			},
			signed_url_image: {
				type: DataTypes.VIRTUAL,
				get: function () {
					const url = encodeURI(
						`https://${config.MS_TUTORIAL_BUCKET}.s3.${
							config.AWS_REGION
						}.amazonaws.com/${this.getDataValue('url_image')}`
					)
					// awsHelper.getFileUrlSync(
					//     this.getDataValue('url_image'),
					//     config.MS_TUTORIAL_BUCKET,
					// );
					return url
				},
			},
			signed_url_image_mobile: {
				type: DataTypes.VIRTUAL,
				get: function () {
					const url = encodeURI(
						`https://${config.MS_TUTORIAL_BUCKET}.s3.${
							config.AWS_REGION
						}.amazonaws.com/${this.getDataValue(
							'url_image_mobile'
						)}`
					)
					// const url = awsHelper.getFileUrlSync(
					//     this.getDataValue('url_image_mobile'),
					//     config.MS_TUTORIAL_BUCKET,
					// );
					return url
				},
			},
			signed_url_image_thumbnail: {
				type: DataTypes.VIRTUAL,
				get: function () {
					const url = encodeURI(
						`https://${config.MS_TUTORIAL_BUCKET}.s3.${
							config.AWS_REGION
						}.amazonaws.com/${this.getDataValue(
							'url_image_thumbnail'
						)}`
					)
					// const url = awsHelper.getFileUrlSync(
					//     this.getDataValue('url_image_thumbnail'),
					//     config.MS_TUTORIAL_BUCKET,
					// );
					return url
				},
			},

			stripe_product_id: {
				type: DataTypes.TEXT,
				defaultValue: '',
			},
			stripe_price_id: {
				type: DataTypes.TEXT,
				defaultValue: '',
			},
			active_campagine_tag: {
				type: DataTypes.INTEGER,
				defaultValue: null,
			},
			is_partial_payment_available: {
				type: DataTypes.TINYINT(1),
				defaultValue: false,
			},
			partialpay_stripe_price_obj: {
				type: DataTypes.TEXT,
				defaultValue: null,
			},
			split_payment_amounts: {
				type: DataTypes.TEXT,
				defaultValue: null,
			},
			split_payment_amounts_obj: {
				type: DataTypes.VIRTUAL,
				get: function () {
					if (this.getDataValue('split_payment_amounts')) {
						const obj = {}
						const arr = JSON.parse(
							this.getDataValue('split_payment_amounts')
						)
						arr.forEach((each, i) => {
							obj[i + 1] = each
						})
						return obj
					}
					return {}
				},
			},
			is_ready_for_Learning: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
			is_public: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
			is_available_pay_mc_wallet: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
			document_url: {
				type: DataTypes.STRING,
				defaultValue: null,
			},
			is_nft_free: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
			active_campagine_list: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			nft_purchase_price: {
				type: DataTypes.NUMBER,
				defaultValue: 0,
			},
			nft_stripe_id: {
				type: DataTypes.STRING,
				defaultValue: '',
			},
			brochure_url: {
				type: DataTypes.STRING,
				defaultValue: '',
			},
			descriptionObj: {
				type: DataTypes.VIRTUAL,
				get: function () {
					try {
						if (this.getDataValue('description')) {
							const arr = JSON.parse(
								this.getDataValue('description')
							)
							return arr
						}
					} catch (err) {
						return this.getDataValue('description')
					}
				},
			},
			Is_NFT_Available: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
			is_sold_out: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
			is_course_restricted_to_users: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
			custom_field_1: {
				type: DataTypes.STRING,
				defaultValue: '',
			},
			custom_field_2: {
				type: DataTypes.STRING,
				defaultValue: '',
			},
			custom_field_3: {
				type: DataTypes.STRING,
				defaultValue: '',
			},
			custom_field_4: {
				type: DataTypes.STRING,
				defaultValue: '',
			},
			custom_field_5: {
				type: DataTypes.STRING,
				defaultValue: '',
			},
			custom_field_6: {
				type: DataTypes.STRING,
				defaultValue: '',
			},
			custom_field_7: {
				type: DataTypes.STRING,
				defaultValue: '',
			},
			custom_field_8: {
				type: DataTypes.STRING,
				defaultValue: '',
			},
			custom_field_9: {
				type: DataTypes.STRING,
				defaultValue: '',
			},
			custom_field_10: {
				type: DataTypes.STRING,
				defaultValue: '',
			},
			online_text: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
			total_modules: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
			training_type: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
			access_type: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
			launguage: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
			ratings: {
				allowNull: true,
				type: DataTypes.DOUBLE,
			},
			telegram_link: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
			whatsapp_link: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
			telegram_users_google_link: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
		},
		{
			sequelize,
			modelName: 'courses',
			timestamps: false,
		}
	)
	return Courses
}
