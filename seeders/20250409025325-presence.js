'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Presences', [
      {
        id: '1',
        location: Sequelize.fn('ST_GeomFromText', 'POINT(-6.255774727241181 106.8065370374879)'),
        employees_id: '1',
        createdAt: new Date("2025-04-14T08:30:00"),
        updatedAt: new Date()
      },
      {
        id: '2',
        location: Sequelize.fn('ST_GeomFromText', 'POINT(-6.255774727241181 106.8065370374879)'),
        employees_id: '2',
        createdAt: new Date("2025-04-14T08:00:00"),
        updatedAt: new Date()
      },
      {
        id: '3',
        location: Sequelize.fn('ST_GeomFromText', 'POINT(-6.255774727241181 106.8065370374879)'),
        employees_id: '3',
        createdAt: new Date("2025-04-14T08:23:00"),
        updatedAt: new Date()
      },
      {
        id: '4',
        location: Sequelize.fn('ST_GeomFromText', 'POINT(-6.255774727241181 106.8065370374879)'),
        employees_id: '2',
        createdAt: new Date("2025-04-14T13:00:00"),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Presences', null, {});
  }
};