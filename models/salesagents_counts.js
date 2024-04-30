const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class Salesagents_counts extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
	}
	Salesagents_counts.init(
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.BIGINT,
			},
			course_id: {
				allowNull: false,
				type: DataTypes.BIGINT,
			},
			no_agents: {
				allowNull: false,
				type: DataTypes.BIGINT,
			},
		},
		{
			sequelize,
			modelName: 'salesagents_counts',
			timestamps: false,
		}
	)
	return Salesagents_counts
}
