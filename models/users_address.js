const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UsersAddress extends Model {
    static associate(models) {
      this.belongsTo(models.users, {foreignKey: 'user_id'});
    }
  }
  UsersAddress.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },
        first_name: {
          type: DataTypes.STRING,
          allowNull:true
        },
        last_name: {
          type: DataTypes.STRING,
          allowNull:true
        },
        phone_number: {
          type: DataTypes.TEXT,
          allowNull:true
        },
        address_line_1: {
          type: DataTypes.TEXT,
          allowNull:true
        },
        address_line_2: {
          type: DataTypes.TEXT,
          allowNull:true
        },
        state: {
          type: DataTypes.STRING,
          allowNull:true
        },
        country: {
          type: DataTypes.STRING,
          allowNull:true
        },
        zip_code: {
          type: DataTypes.STRING,
          allowNull:true
        },
        is_default: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        user_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
        },
        updated_at: {
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
        modelName: 'users_addresses',
        timestamps: false,
      },
  );
  return UsersAddress;
};
