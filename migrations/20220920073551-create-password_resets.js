'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('password_resets',
        {
          email: {
            primaryKey: true,
            allowNull: false,
            type: Sequelize.BIGINT,
          },
          token: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          created_at: {
            type: Sequelize.DATE,
            defaultValue: new Date(),
          },
        });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('password_resets');
  },
};
