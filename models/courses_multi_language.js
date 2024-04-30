const {Model} = require('sequelize');
const AWS = require('aws-sdk');
const config = require('../src/config/config');
const awsHelper = require('../src/helpers/aws.helper');
const AWSS3Bucket = config.MS_TUTORIAL_BUCKET;
const s3 = new AWS.S3();

AWS.config.update({
  signatureVersion: 'v4',
  accessKeyId: config.AWS_ACCESS_KEY,
  secretAccessKey: config.AWS_SECRET_KEY,
});
const signedUrlExpireSeconds = 60 * 5;

module.exports = (sequelize, DataTypes) => {
  class CoursesMultiLanguage extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      this.belongsTo(models.users, {
        foreignKey: 'course_id',
        as: 'courseDetails',
      });
    }
  }
  CoursesMultiLanguage.init(
      {
        course_id: {
          type: DataTypes.BIGINT
        },
        language_code: {
          type: DataTypes.STRING
        },
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
        signed_url_image: {
          type: DataTypes.VIRTUAL,
          get: function() {
            const url = encodeURI(`https://${config.MS_TUTORIAL_BUCKET}.s3.${config.AWS_REGION}.amazonaws.com/${this.getDataValue('url_image')}`)
            // awsHelper.getFileUrlSync(
            //     this.getDataValue('url_image'),
            //     config.MS_TUTORIAL_BUCKET,
            // );
            return url;
          },
        },
        signed_url_image_mobile: {
          type: DataTypes.VIRTUAL,
          get: function() {
            const url = encodeURI(`https://${config.MS_TUTORIAL_BUCKET}.s3.${config.AWS_REGION}.amazonaws.com/${this.getDataValue('url_image_mobile')}`)
            // const url = awsHelper.getFileUrlSync(
            //     this.getDataValue('url_image_mobile'),
            //     config.MS_TUTORIAL_BUCKET,
            // );
            return url;
          },
        },
        signed_url_image_thumbnail: {
          type: DataTypes.VIRTUAL,
          get: function() {
            const url = encodeURI(`https://${config.MS_TUTORIAL_BUCKET}.s3.${config.AWS_REGION}.amazonaws.com/${this.getDataValue('url_image_thumbnail')}`)
            // const url = awsHelper.getFileUrlSync(
            //     this.getDataValue('url_image_thumbnail'),
            //     config.MS_TUTORIAL_BUCKET,
            // );
            return url;
          },
        },
        document_url: {
          type: DataTypes.STRING,
          defaultValue: null
        },
        brochure_url: {
          type: DataTypes.STRING,
          defaultValue: ''
        },
        descriptionObj: {
          type: DataTypes.VIRTUAL,
          get: function() {
            try {
              if(this.getDataValue('description')) {
                const arr = JSON.parse(this.getDataValue('description'))
                return arr;
              }  
            } catch (err) {
              return this.getDataValue('description')
            }
          },
        },
      },
      {
        sequelize,
        modelName: 'courses_multi_language',
        tableName: 'courses_multi_language',
        timestamps: false,
      },
  );
  return CoursesMultiLanguage;
};
