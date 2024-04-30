const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class CoursesSubModules extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {}
	}
	CoursesSubModules.init(
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.BIGINT,
			},

			name: {
				type: DataTypes.TEXT,
				defaultValue: '',
			},
			course_id: {
				allowNull: true,
				type: DataTypes.BIGINT,
			},
			module_id: {
				allowNull: true,
				type: DataTypes.BIGINT,
			},
			created_at: {
				defaultValue: new Date(),
				type: DataTypes.DATE,
			},
		},
		{
			sequelize,
			modelName: 'course_submodules',
			timestamps: false,
		}
	)
	return CoursesSubModules
}
