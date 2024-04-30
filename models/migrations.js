const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Migrations extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      // define association here
    }
  }
  Migrations.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        migration: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        batch: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'migrations',
      },
  );
  return Migrations;
};
