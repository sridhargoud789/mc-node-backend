const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CoinValues extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      // define association here
    }
  }
  CoinValues.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        coin_symbol: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        coingeco: {
          type: DataTypes.DOUBLE,
          defaultValue: 0,
        },
        coinmarketcap: {
          type: DataTypes.DOUBLE,
          defaultValue: 0,
        },
        coinranking: {
          type: DataTypes.DOUBLE,
          defaultValue: 0,
        },
        bybit: {
          type: DataTypes.DOUBLE,
          defaultValue: 0,
        },
        waves: {
          type: DataTypes.DOUBLE,
          defaultValue: 0,
        },
        avg_24h: {
          type: DataTypes.DOUBLE,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        modelName: 'coin_values',
        timestamps: false,
      },
  );
  return CoinValues;
};
