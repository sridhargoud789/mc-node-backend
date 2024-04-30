const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
	class CourseInvoices extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {}
	}
	CourseInvoices.init(
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.BIGINT,
			},
			amount: {
				type: DataTypes.DOUBLE,
				allowNull: false,
			},
			invoice_pdf_url: {
				allowNull: true,
				type: DataTypes.TEXT('long'),
			},
			user_id: {
				allowNull: true,
				type: DataTypes.BIGINT,
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
			modelName: 'course_invoices',
			timestamps: false,
		}
	)
	return CourseInvoices
}
