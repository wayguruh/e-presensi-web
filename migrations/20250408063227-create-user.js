'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(72),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM,
        values: ['Admin', 'Karyawan'],
        defaultValue: 'Karyawan',
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM,
        values: ['Active', 'Inactive'],
        defaultValue: 'Active',
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};