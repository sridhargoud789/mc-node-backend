const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserInquiries extends Model {
    static associate(models) {
      this.belongsTo(models.users, {foreignKey: 'user_id'});
    }
  }
  UserInquiries.init(
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
          unique: true
        },
        sourse: {
          type: DataTypes.STRING,
        },
        name: {
          type: DataTypes.STRING,
        },
        email: {
          type: DataTypes.STRING,
        },
        phone_number: {
          type: DataTypes.STRING,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
       },
      {
        sequelize,
        modelName: 'user_inquiries',
        timestamps: false,
      },
  );
  return UserInquiries;
};
