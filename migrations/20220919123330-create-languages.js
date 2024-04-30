'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('languages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        defaultValue: new Date(),
        type: Sequelize.DATE,
      },
      updated_at: {
        defaultValue: new Date(),
        type: Sequelize.DATE,
      },
      deleted_at: {
        defaultValue: new Date(),
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('languages');
  },
};
