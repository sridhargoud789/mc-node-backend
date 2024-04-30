const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LectureDocuments extends Model {
    static associate(models) {
      this.belongsTo(models.lecture_documents, {foreignKey: 'lecture_id', as: 'lectures'});
    }
  }
  LectureDocuments.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        lecture_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        doc_name: {
          type: DataTypes.TEXT,
        },
        doc_url: {
          type: DataTypes.TEXT,
        },
        doc_type: {
          type: DataTypes.TEXT,
        },
        created_at: {
          defaultValue: new Date(),
          type: DataTypes.DATE,
        },
        updated_at: {
          defaultValue: new Date(),
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
        modelName: 'lecture_documents',
        timestamps: false,
      },
  );
  return LectureDocuments;
};
