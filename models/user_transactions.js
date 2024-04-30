const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserTransactions extends Model {
    static associate(models) {
      this.belongsTo(models.users, {foreignKey: 'user_id'});
    }
  }
  UserTransactions.init(
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
        transaction_id: {
          type: DataTypes.STRING,
        },
        amount: {
          allowNull: false,
          type: DataTypes.DOUBLE,
        },
        payment_with: {
          type: DataTypes.STRING,
          values: ['coinbase', 'paypal', 'mct_token', 'stripe', 'wallet_pay'],
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
        used_discount_id: {
          type: DataTypes.BIGINT,
          defaultValue: null,
        }
      },
      {
        sequelize,
        modelName: 'user_transactions',
        timestamps: false,
      },
  );
  return UserTransactions;
};
