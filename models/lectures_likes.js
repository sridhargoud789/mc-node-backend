const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class Lectures_likes extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
	}
	Lectures_likes.init(
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.BIGINT,
			},
			lecture_id: {
				allowNull: false,
				type: DataTypes.BIGINT,
			},
			like_dislike: {
				allowNull: false,
				type: DataTypes.TINYINT(1),
			},
			user_id: {
				allowNull: false,
				type: DataTypes.BIGINT,
			},
			created_at: {
				type: DataTypes.DATE,
				defaultValue: new Date(),
			},
		},
		{
			sequelize,
			modelName: 'lectures_likes',
			timestamps: false,
		}
	)
	return Lectures_likes
}
