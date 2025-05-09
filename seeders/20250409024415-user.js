'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        id: '1',
        username: 'admin',
        password: bcrypt.hashSync('admin123', 10),
        role: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        username: 'johndoe',
        password: bcrypt.hashSync('admin123', 10),
        role: 'Karyawan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        username: 'janedoe',
        password: bcrypt.hashSync('admin123', 10),
        role: 'Karyawan',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
