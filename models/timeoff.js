'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TimeOff extends Model {}

  TimeOff.init({
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    description: DataTypes.TEXT,
    approved: {
      type: DataTypes.ENUM,
      values: ['PENDING', 'APPROVED', 'REJECTED'],
      defaultValue: 'PENDING'
    },
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
    modelName: 'TimeOff',
    timestamps: true
  });

  TimeOff.associate = (models) => {
    TimeOff.belongsTo(models.Employee, { foreignKey: 'employees_id' });
  }

  return TimeOff;
};