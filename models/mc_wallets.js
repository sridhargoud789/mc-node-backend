const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MCWallets extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      // define association here
      this.belongsTo(models.users, {foreignKey: 'user_id', as: 'user'});
    }
  }
  MCWallets.init(
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
        token_balance: {
          type: DataTypes.NUMBER,
          allowNull: false,
          defaultValue: 0,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: new Date()
        }
      },
      {
        sequelize,
        modelName: 'mc_wallets',
        timestamps: false,
      },
  );
  return MCWallets;
};
