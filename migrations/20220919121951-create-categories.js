'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      article_id: {
        allowNull: false,
        type: Sequelize.BIGINT,
      },
      tag_id: {
        allowNull: false,
        type: Sequelize.BIGINT,
      },
      language_id: {
        allowNull: false,
        type: Sequelize.BIGINT,
      },
      created_at: {
        defaultValue: new Date(),
        type: Sequelize.DATE,
      },
      updated_at: {
        defaultValue: new Date(),
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('categories');
  },
};
