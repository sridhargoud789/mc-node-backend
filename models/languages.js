const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Languages extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {

    }
  }
  Languages.init(
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
        modelName: 'languages',
        timestamps: false,
      },
  );
  return Languages;
};
