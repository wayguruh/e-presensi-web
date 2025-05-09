'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('TimeOffs', [
      {
        id: '1',
        title: 'Izin Sakit',
        start_date: new Date('2025-04-10'),
        end_date: new Date('2025-04-11'),
        description: 'Lorem ipsum dolor sit amet',
        employees_id: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        title: 'Cuti Sakit',
        start_date: new Date('2025-04-10'),
        end_date: new Date('2025-04-11'),
        description: 'Lorem ipsum dolor sit amet',
        employees_id: '2',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        title: 'Izin Sakit',
        start_date: new Date('2025-04-10'),
        end_date: new Date('2025-04-11'),
        description: 'Lorem ipsum dolor sit amet',
        employees_id: '3',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('TimeOffs', null, {});
  }
};