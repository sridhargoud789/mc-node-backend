const { Model } = require('sequelize')
const config = require('../src/config/config')
module.exports = (sequelize, DataTypes) => {
	class CoursesLectures extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			this.belongsTo(models.courses, {
				foreignKey: 'course_id',
				as: 'courses',
			})
			this.belongsTo(models.course_modules, {
				foreignKey: 'module_id',
				as: 'courseModules',
			})
			this.hasMany(models.lecture_documents, {
				foreignKey: 'lecture_id',
				as: 'documents',
			})
			this.hasOne(models.course_lectures_multi_languages, {
				foreignKey: 'lecture_id',
				as: 'lectureData',
			})
			this.belongsTo(models.course_submodules, {
				foreignKey: 'sub_module_id',
				as: 'sub_modules',
			})
		}
	}
	CoursesLectures.init(
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
			module_id: {
				allowNull: true,
				type: DataTypes.BIGINT,
			},
			name: {
				type: DataTypes.TEXT,
				defaultValue: '',
			},
			description: {
				type: DataTypes.TEXT,
				defaultValue: '',
			},
			duration: {
				type: DataTypes.NUMBER,
				defaultValue: 0,
			},
			video_thumbnail: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
			video_url: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
			lecture_index: {
				type: DataTypes.NUMBER,
				defaultValue: 0,
			},
			live_stream_url: {
				type: DataTypes.TEXT,
				defaultValue: '',
			},
			created_at: {
				defaultValue: new Date(),
				type: DataTypes.DATE,
			},
			updated_at: {
				defaultValue: new Date(),
				type: DataTypes.DATE,
			},
			sub_module_id: {
				allowNull: true,
				type: DataTypes.BIGINT,
			},
			signed_video_url: {
				type: DataTypes.VIRTUAL,
				get: function () {
					const url = encodeURI(
						`https://${config.MS_PUBLIC_S3}.s3.${
							config.AWS_REGION
						}.amazonaws.com/${this.getDataValue('video_url')}`
					)
					// const url = awsHelper.getFileUrlSync(
					//     this.getDataValue('url_image_mobile'),
					//     config.MS_TUTORIAL_BUCKET,
					// );
					return url
				},
			},
		},
		{
			sequelize,
			modelName: 'course_lectures',
			timestamps: false,
		}
	)
	return CoursesLectures
}
