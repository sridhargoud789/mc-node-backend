const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserWishlist extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      this.belongsTo(models.users, {foreignKey: 'user_id'});
      this.belongsTo(models.courses, {foreignKey: 'course_id'});
      // define association here
    }
  }
  UserWishlist.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        user_id: {
          allowNull: false,
          type: DataTypes.BIGINT,
        },
        course_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
      },
      {
        sequelize,
        modelName: 'user_wishlist',
        tableName: 'user_wishlist',
        timestamps: false,
      },
  );
  return UserWishlist;
};
