const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CoursesFor extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      this.belongsTo(models.courses, {foreignKey: 'course_id', as: 'courses'});
    }
  }
  CoursesFor.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },

        developer: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        entrepreneur: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        gamer: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        crypto_analist: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        investor: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },

        course_id: {
          allowNull: true,
          type: DataTypes.BIGINT,
        },
        created_at: {
          defaultValue: new Date(),
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
        modelName: 'course_for',
        tableName: 'course_for',
        timestamps: false,
      },
  );
  return CoursesFor;
};
