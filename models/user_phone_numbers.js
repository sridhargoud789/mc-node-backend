const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserPhoneNumbers extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      // define association here
   
    }
  }
  UserPhoneNumbers.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },
        phone_number: {
          type: DataTypes.STRING,
          require: true,
        },
        is_verified: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        otp: {
          type: DataTypes.NUMBER,
        },
        expiry_time: {
          type: DataTypes.DATE,
          require: true
        }
      },
      {
        sequelize,
        modelName: 'user_phone_numbers',
        timestamps: false,
      },
  );
  return UserPhoneNumbers;
};
