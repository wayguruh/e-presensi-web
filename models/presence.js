'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Presence extends Model {}

  Presence.init({
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    location: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: false
    },
    description: DataTypes.TEXT,
    employees_id: {
      type: DataTypes.STRING(36),
      references: {
        model: 'Employee',
        key: 'id'
      },
      onDelete: 'SET NULL'
    }
  }, {
    sequelize,
    modelName: 'Presence',
    timestamps: true
  });

  Presence.associate = (models) => {
    Presence.belongsTo(models.Employee, { foreignKey: 'employees_id' });
  }

  return Presence;
};