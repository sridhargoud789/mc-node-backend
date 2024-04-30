const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CoursesPackages extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
    }
  }
  CoursesPackages.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },

        name: {
          type: DataTypes.TEXT,
          defaultValue: '',
        },
        description: {
          type: DataTypes.TEXT('long'),
          defaultValue: '',
        },
        price: {
          type: DataTypes.DOUBLE,
          defaultValue: 0,
        },
        banner_url: {
          type: DataTypes.TEXT,
          defaultValue: '',
        },
        course_ids: {
          allowNull: true,
          type: DataTypes.TEXT,
        },
        created_at: {
          defaultValue: new Date(),
          type: DataTypes.DATE,
        },
        is_active: {
          type: DataTypes.TINYINT(1),
          allowNull: false,
          defaultValue: 0,
        },
        stripe_product_id: {
          type: DataTypes.TEXT,
          defaultValue: '',
        },
        stripe_price_id: {
          type: DataTypes.TEXT,
          defaultValue: '',
        },
      },
      {
        sequelize,
        modelName: 'course_packages',
        timestamps: false,
      },
  );
  return CoursesPackages;
};
