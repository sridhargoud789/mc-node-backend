'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('migrations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      migration: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      batch: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('migrations');
  },
};
