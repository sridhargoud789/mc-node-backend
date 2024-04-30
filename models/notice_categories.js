const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NoticeCategories extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      this.belongsTo(models.languages, {foreignKey: 'language_id'});
    }
  }
  NoticeCategories.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        slug: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        language_id: {
          type: DataTypes.BIGINT,
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
        modelName: 'notice_categories',
        timestamps: false,
      },
  );
  return NoticeCategories;
};
