'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {}

  Employee.init({
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    fullname: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM,
      values: ['Perempuan', 'Laki-laki']
    },
    phone: DataTypes.STRING(14),
    users_id: {
      type: DataTypes.STRING(36),
      references: {
        model: 'User',
        key: 'id'
      },
      onDelete: 'SET NULL'
    }
  }, {
    sequelize,
    modelName: 'Employee',
    timestamps: true
  });

  Employee.associate = (models) => {
    Employee.belongsTo(models.User, { foreignKey: 'users_id' });
    Employee.hasMany(models.Presence, { foreignKey: 'employees_id', onDelete: 'SET NULL' });
    Employee.hasMany(models.TimeOff, { foreignKey: 'employees_id', onDelete: 'SET NULL' });
  }

  return Employee;
};