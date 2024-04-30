const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Testimonials extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      // define association here
      this.belongsTo(models.users, {foreignKey: 'user_id', as: 'user'});
      // this.belongsTo(models.courses, {foreignKey: 'course_id', as: 'course'});
    }
  }
  Testimonials.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        user_id: {
          type: DataTypes.BIGINT,
          defaultValue: null,
        },
        course_id: {
          type: DataTypes.BIGINT,
          defaultValue: null,
        },
        name: {
          type: DataTypes.TEXT,
          defaultValue: null,
        },
        description: {
          type: DataTypes.TEXT,
          defaultValue: null,
        },
        star: {
          type: DataTypes.DOUBLE,
          defaultValue: 0,
        },
        url_image: {
          type: DataTypes.TEXT,
          defaultValue: null,
        },
        is_public_visible: {
          type: DataTypes.TINYINT,
          defaultValue: 0,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: new Date(),
        },
      },
      {
        sequelize,
        modelName: 'testimonials',
        timestamps: false,
      },
  );
  return Testimonials;
};
