const EmployeeModel = require('../models').Employee;
const UserModel = require('../models').User;
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res) => {
    try {
        const { userId, withUser, limit = 15, page = 1, search } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        const includeClause = {};

        if (userId) {
            whereClause.users_id = userId;
        }

        if (withUser || userId) {
            includeClause.model = UserModel;
            includeClause.attributes = ['id', 'username', 'role', 'status'];
        }

        if (search) {
            whereClause[Op.or] = [
                { fullname: { [Op.like]: `%${search}%` } },
                { '$User.username$': { [Op.like]: `%${search}%` } },
                { '$User.role$': { [Op.like]: `%${search}%` } },
                { '$User.status$': { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
            ]
        }

        const { count, rows: employees } = await EmployeeModel.findAndCountAll({
            where: whereClause,
            include: includeClause,
            order: ['fullname'],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        
        if (!employees) {
            return res.status(400).json({ message: 'Data tidak ditemukan' });
        }

        res.status(200).json({
            data: employees,
            total: count,
            current_page: page,
            total_pages: Math.ceil(count / limit),
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getTotal = async (req, res) => {
    try {
        const count = await EmployeeModel.count();
        res.status(200).json({
            data: count
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getById = async (req, res) => {
    try {
        const employee = await EmployeeModel.findByPk(req.params.id);
        if (!employee) {
            return res.status(400).json({ message: 'Data tidak ditemukan' });
        }

        res.status(200).json({
            data: employee,
            message: 'Data karyawan berhasil diambil'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.create = async (req, res) => {
    try {
        const employee = await EmployeeModel.create({
            ...req.body,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        if (!employee) {
            return res.status(400).json({ message: 'Gagal menambahkan data' });
        }

        res.status(201).json({
            data: employee,
            message: 'Data karyawan berhasil ditambahkan'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.update = async (req, res) => {
    try {
        const response = await EmployeeModel.update(
            {
                ...req.body,
                updatedAt: new Date()
            },
            {
                where: { id: req.params.id }
            }
        );
        if (response === 0) {
            return res.status(400).json({ message: 'Gagal mengubah data' });
        }

        const updatedData = await EmployeeModel.findOne({
            where: { id: req.params.id },
            include: {
                model: UserModel
            }
        });

        res.status(200).json({
            data: updatedData,
            message: 'Data karyawan berhasil diubah'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.delete = async (req, res) => {
    try {
        const dataDeleted = await EmployeeModel.destroy({ where: { id: req.params.id } });
        if (dataDeleted === 0) {
            return res.status(400).json({ message: 'Gagal menghapus data' });
        }

        res.status(200).json({ message: 'Data karyawan berhasil dihapus' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.bulkDelete = async (req, res) => {
    try {
        const dataDeleted = await EmployeeModel.destroy({ where: { id: req.body.ids } });
        if (dataDeleted === 0) {
            return res.status(400).json({ message: 'Gagal menghapus data' });
        }

        res.status(200).json({ message: 'Data karyawan berhasil dihapus' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};