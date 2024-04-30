const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HistoryMcWallets extends Model {
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
  HistoryMcWallets.init(
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
        amount: {
          type: DataTypes.NUMBER,
          allowNull: false,
          defaultValue: 0,
        },
        transaction_type: {
          type: DataTypes.TEXT,
          enum: ['credit', 'debit']
        },
        referral_code: {
          type: DataTypes.BIGINT,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
      },
      {
        sequelize,
        modelName: 'history_mc_wallets',
        timestamps: false,
      },
  );
  return HistoryMcWallets;
};
