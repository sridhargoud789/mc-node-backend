const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CoursesModulesMultiLanguages extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      this.belongsTo(models.course_modules, {foreignKey: 'module_id', as: 'moduleData'});
    }
  }
  CoursesModulesMultiLanguages.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        module_id: {
          type: DataTypes.BIGINT,
        },
        language_code: {
          type: DataTypes.TEXT
        },
        name: {
          type: DataTypes.TEXT,
          defaultValue: '',
        },
        description: {
          type: DataTypes.TEXT('long'),
          defaultValue: '',
        },
      },
      {
        sequelize,
        modelName: 'course_modules_multi_languages',
        timestamps: false,
      },
  );
  return CoursesModulesMultiLanguages;
};
