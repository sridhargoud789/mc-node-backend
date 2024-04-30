'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      name: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      email_verified_at: {
        type: Sequelize.DATE,
      },
      password: {
        type: Sequelize.STRING,
      },
      two_factor_secret: {
        type: Sequelize.STRING,
      },
      two_factor_recovery_codes: {
        type: Sequelize.STRING,
      },
      date_birth: {
        type: Sequelize.STRING,
      },
      gender: {
        type: Sequelize.STRING,
      },
      adult: {
        type: Sequelize.INTEGER,
      },
      accept_private_policy: {
        type: Sequelize.INTEGER,
      },
      token: {
        type: Sequelize.STRING,
      },
      remember_token: {
        type: Sequelize.STRING,
      },
      role_id: {
        type: Sequelize.BIGINT,
      },
      level_id: {
        type: Sequelize.BIGINT,
      },
      language_id: {
        type: Sequelize.BIGINT,
      },
      newsletter_id: {
        type: Sequelize.BIGINT,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deleted_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      avatar: {
        type: Sequelize.BLOB('long'),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
