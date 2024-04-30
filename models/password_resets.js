const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PasswordResets extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      // define association here
    }
  }
  PasswordResets.init(
      {
        email: {
          primaryKey: true,
          allowNull: false,
          type: DataTypes.BIGINT,
        },
        token: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        expired_at: {
          type: DataTypes.DATE,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
      },
      {
        sequelize,
        modelName: 'password_resets',
        timestamps: false,
      },
  );
  return PasswordResets;
};
