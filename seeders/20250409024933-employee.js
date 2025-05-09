'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Employees', [
      {
        id: '1',
        fullname: 'Admin',
        gender: 'Perempuan',
        phone: '081212345678',
        users_id: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        fullname: 'John Doe',
        gender: 'Laki-laki',
        phone: '081212345678',
        users_id: '2',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        fullname: 'Jane Doe',
        gender: 'Perempuan',
        phone: '081212345678',
        users_id: '3',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Employees', null, {});
  }
};