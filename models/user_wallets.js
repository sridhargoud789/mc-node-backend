const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserWallets extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      this.belongsTo(models.users, {foreignKey: 'user_id', as: 'userData'});
    }
  }
  UserWallets.init(
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
        wallet_address: {
          allowNull: false,
          type: DataTypes.BIGINT,
        },
        is_default: {
          type: DataTypes.TINYINT(1),
          allowNull: false,
          defaultValue: 0,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
      },
      {
        sequelize,
        modelName: 'users_wallets',
        timestamps: false,
      },
  );
  return UserWallets;
};
