const TimeOffModel = require('../models').TimeOff;
const EmployeeModel = require('../models').Employee;
const filter = require('../helpers/filter');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res) => {
    try {
        const { employeeId, status, day, week, month, year, limit = 15, page = 1, search } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};

        if (employeeId) {
            whereClause.employees_id = employeeId;
        }

        if (status) {
            whereClause.approved = status;
        }

        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { '$Employee.fullname$': { [Op.like]: `%${search}%` } },
                { start_date: { [Op.like]: `%${search}%` } },
                { end_date: { [Op.like]: `%${search}%` } },
                { approved: { [Op.like]: `%${search}%` } },
                { createdAt: { [Op.like]: `%${search}%` } }
            ]
        }

        if (day && month && year) {
            const targetDate = new Date(Date.UTC(year, month - 1, day));
            const date = new Date(targetDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
            whereClause.start_date = { [Op.lte]: date };
            whereClause.end_date = { [Op.gte]: date };
        } else if (week && month && year) {
            const { startDate, endDate } = filter.getDateRangeOfWeek(parseInt(week), parseInt(month), parseInt(year));
            whereClause.start_date = {
                [Op.between]: [startDate, endDate]
            };
            whereClause.end_date = {
                [Op.between]: [startDate, endDate]
            };
        }
        
        const { count, rows: timeOffs } = await TimeOffModel.findAndCountAll({
            where: whereClause,
            include: {
                model: EmployeeModel,
                attributes: ['fullname'],
            },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        if (!timeOffs) {
            return res.status(400).json({ message: 'Data tidak ditemukan' });
        }

        res.status(200).json({
            data: timeOffs,
            total: count,
            current_page: page,
            total_pages: Math.ceil(count / limit),
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getTotalTimeoffDays = async (req, res) => {
    try {
        const { employeeId, status } = req.query;
        const whereClause = {};

        if (employeeId) {
            whereClause.employees_id = employeeId;
        }

        if (status) {
            whereClause.approved = status;
        }

        const timeoffs = await TimeOffModel.findAll({
            where: whereClause
        });

        let totalDays = 0;

        timeoffs.forEach(timeoff => {
            const start = new Date(timeoff.start_date);
            const end = new Date(timeoff.end_date);

            const diffTime = Math.abs(end - start);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

            totalDays += diffDays;
        });

        res.status(200).json({
            data: totalDays,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getById = async (req, res) => {
    try {
        const timeOff = await TimeOffModel.findByPk(req.params.id);
        if (!timeOff) {
            return res.status(400).json({ message: 'Data tidak ditemukan' });
        }

        res.status(200).json({
            data: timeOff,
            message: 'Data berhasil diambil'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.create = async (req, res) => {
    try {
        const timeOff = await TimeOffModel.create({
            ...req.body,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        if (!timeOff) {
            return res.status(400).json({ message: 'Gagal menambahkan data' });
        }

        res.status(201).json({
            data: timeOff,
            message: 'Data izin berhasil ditambahkan'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.update = async (req, res) => {
    try {
        const response = await TimeOffModel.update(
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

        const updatedData = await TimeOffModel.findOne({ where: { id: req.params.id } });

        res.status(200).json({
            data: updatedData,
            message: 'Data izin berhasil diubah'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.delete = async (req, res) => {
    try {
        const dataDeleted = await TimeOffModel.destroy({ where: { id: req.params.id } });
        if (dataDeleted === 0) {
            return res.status(400).json({ message: 'Gagal menghapus data' });
        }

        res.status(200).json({ message: 'Data izin berhasil dihapus' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.bulkDelete = async (req, res) => {
    try {
        const dataDeleted = await TimeOffModel.destroy({ where: { id: req.body.ids } });
        if (dataDeleted === 0) {
            return res.status(400).json({ message: 'Gagal menghapus data' });
        }

        res.status(200).json({ message: 'Data izin berhasil dihapus' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};