const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Levels extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      // define association here
    }
  }
  Levels.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        code: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        name: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        created_at: {
          defaultValue: new Date(),
          type: DataTypes.DATE,
        },
        updated_at: {
          defaultValue: new Date(),
          type: DataTypes.DATE,
        },
        deleted_at: {
          defaultValue: new Date(),
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
        modelName: 'levels',
        timestamps: false,
      },
  );
  return Levels;
};
