const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CoursesLecturesMultiLanguages extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      this.belongsTo(models.course_lectures, {foreignKey: 'lecture_id', as: 'lectureData'});
    }
  }
  CoursesLecturesMultiLanguages.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        lecture_id: {
          type: DataTypes.BIGINT,
        },
        language_code: {
          type: DataTypes.TEXT,
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
        live_stream_url: {
          type: DataTypes.TEXT,
          defaultValue: ''
        },
      },
      {
        sequelize,
        modelName: 'course_lectures_multi_languages',
        timestamps: false,
      },
  );
  return CoursesLecturesMultiLanguages;
};
