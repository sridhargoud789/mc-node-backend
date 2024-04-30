'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_testimonials', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      user_id: {
        type: Sequelize.BIGINT,
        defaultValue: null,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      star: {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_testimonials');
  },
};
