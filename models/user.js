'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {}

  User.init({
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notContains: ' '
      }
    },
    password: {
      type: DataTypes.STRING(72),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM,
      values: ['Admin', 'Karyawan'],
      defaultValue: 'Karyawan',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM,
      values: ['Active', 'Inactive'],
      defaultValue: 'Active',
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true
  });

  User.associate = (models) => {
    User.hasOne(models.Employee, { foreignKey: 'users_id', onDelete: 'SET NULL' });
  }

  return User;
};