const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReferralCodesMcWallets extends Model {
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
  ReferralCodesMcWallets.init(
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
        code: {
          allowNull: false,
          type: DataTypes.STRING,
        },
        mct_amount: {
          type: DataTypes.DOUBLE,
        },
        is_active: {
          type: DataTypes.TINYINT(1),
				  defaultValue: false
        },
        expired_at: {
          type: DataTypes.DATE,
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
        modelName: 'referral_codes_mc_wallets',
        timestamps: false,
      },
  );
  return ReferralCodesMcWallets;
};
