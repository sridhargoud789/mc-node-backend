'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notice_categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      language_id: {
        type: Sequelize.BIGINT,
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
    await queryInterface.dropTable('notice_categories');
  },
};
