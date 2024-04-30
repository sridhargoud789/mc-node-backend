const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentInstallments extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      // define association here
      this.belongsTo(models.users, {foreignKey: 'user_id', as: 'user'});
      this.belongsTo(models.courses, {foreignKey: 'course_id', as: 'courseData'});
    }
  }
  PaymentInstallments.init(
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
        mct_amount_on_purchase: {
          type: DataTypes.DOUBLE,
          allowNull: false,
        },
        payment_with: {
          type: DataTypes.STRING,
          values: ['coinbase', 'paypal', 'mct_token', 'stripe'],
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
        status: {
          type: DataTypes.STRING,
          values: ['success', 'pending', 'failed'],
          defaultValue: 'pending',
        },
        is_full_pay: {
        	type: DataTypes.TINYINT(1),
				  defaultValue: false,
        }
      },
      {
        sequelize,
        modelName: 'payment_installments',
        timestamps: false,
      },
  );
  return PaymentInstallments;
};
