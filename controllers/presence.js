const PresenceModel = require('../models').Presence;
const EmployeeModel = require('../models').Employee;
const filter = require('../helpers/filter');
const { Op, Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res) => {
    try {
        const { employeeId, week, month, year, limit = 15, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        let dateFilter = null;

        if (employeeId) {
            whereClause.employees_id = employeeId;
        }

        if (week && month && year) {
            const { startDate, endDate } = filter.getDateRangeOfWeek(parseInt(week), parseInt(month), parseInt(year));
            dateFilter = {
                [Op.between]: [startDate, endDate],
            };
        } else if (!week && month && year) {
            const startDate = new Date(year, month - 1, 1).toISOString().slice(0, 10);
            const endDate = new Date(year, month, 0).toISOString().slice(0, 10);
            dateFilter = {
                [Op.between]: [startDate, endDate],
            };
        }

        if (dateFilter) {
            whereClause.createdAt = dateFilter;
        }

        const { count, rows: presences } = await PresenceModel.findAndCountAll({
            where: whereClause,
            include: {
                model: EmployeeModel,
                attributes: ['fullname'],
            },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        if (!presences) {
            return res.status(400).json({ message: 'Data tidak ditemukan' });
        }

        res.status(200).json({
            data: presences,
            total: count,
            current_page: page,
            total_pages: Math.ceil(count / limit),
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getTotalPresence = async (req, res) => {
    try {
        const { employeeId, month, year } = req.query;
        const whereClause = {};

        if (employeeId) {
            whereClause.employees_id = employeeId;
        }

        if (!month || !year) {
            return res.status(400).json({ message: 'Bulan dan tahun belum ditentukan' });
        }

        const startDate = new Date(year, month - 1, 1).toISOString().slice(0, 10);
        const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

        const presences = await PresenceModel.findAll({
            where: {
                ...whereClause,
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: [
                [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'day']
            ],
            group: ['day'],
            raw: true
        });

        res.status(200).json({
            data: presences.length,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getPresenceRecap = async (req, res) => {
    try {
        const { day, month, year, week, employeeId } = req.query;
        const whereClausePresences = {};
        const whereClauseEmployees = {};
        let dateList = [];

        if (employeeId) {
            whereClauseEmployees.id = employeeId;
        }

        if (day && month && year) {
            const targetDate = new Date(Date.UTC(year, month - 1, day));
            const startOfDay = new Date(targetDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
            const endOfDay = new Date(targetDate.toISOString().split('T')[0] + 'T23:59:59.999Z');

            whereClausePresences.createdAt = {
                [Op.between]: [startOfDay, endOfDay]
            };
            dateList = [targetDate.toISOString().split('T')[0]];
        } else if (week && month && year) {
            const { startDate, endDate } = filter.getDateRangeOfWeek(parseInt(week), parseInt(month), parseInt(year));
            whereClausePresences.createdAt = {
                [Op.between]: [startDate, endDate]
            };

            const current = new Date(startDate);
            const end = new Date(endDate) > new Date ? new Date : new Date(endDate);
            while (current <= end) {
                const day = current.getDay();
                if (day !== 0 && day !== 6) {
                    dateList.push(new Date(current).toISOString().split('T')[0]);
                }
                current.setUTCDate(current.getUTCDate() + 1);
            }
        } else if (month && year) {
            const startOfMonth = new Date(`${year}-${month.toString().padStart(2, '0')}-01T00:00:00.000Z`);
            const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

            whereClausePresences.createdAt = {
                [Op.between]: [startOfMonth.toISOString(), endOfMonth.toISOString()]
            };

            const current = new Date(startOfMonth);
            const end = new Date(endOfMonth) > new Date ? new Date : new Date(endOfMonth);
            while (current <= end) {
                const day = current.getDay();
                if (day !== 0 && day !== 6) {
                    dateList.push(new Date(current).toISOString().split('T')[0]);
                }
                current.setUTCDate(current.getUTCDate() + 1);
            }
        } else {
            return res.status(400).json({ message: 'Terjadi kesalahan pada input tanggal' });
        }

        const presences = await EmployeeModel.findAll({
            where: whereClauseEmployees,
            attributes: ['id', 'fullname'],
            include: {
                model: PresenceModel,
                where: whereClausePresences,
                required: false
            },
            order: [['fullname', 'ASC']]
        });

        const grouped = {};

        for (const item of presences) {
            if (item.Presences && item.Presences.length > 0) {
                for (const presence of item.Presences) {
                    const dateUTC = new Date(presence.createdAt);
                    const date = new Date(dateUTC.getTime() + 7 * 60 * 60 * 1000);
                    const dateStr = date.toISOString().split('T')[0];
                    const key = `${item.id}|${dateStr}`;
        
                    if (!grouped[key]) {
                        grouped[key] = {
                            id: key,
                            name: item.fullname,
                            date: dateStr,
                            morning: {
                                time: null,
                                description: null,
                                location: null
                            },
                            afternoon: {
                                time: null,
                                description: null,
                                location: null
                            },
                            evening: {
                                time: null,
                                description: null,
                                location: null
                            },
                        };
                    }
        
                    const hour = date.getUTCHours();
        
                    if (hour >= 7 && hour <= 10) grouped[key].morning = {
                        time: presence.createdAt,
                        description: presence.description,
                        location: presence.location
                    };
                    else if (hour >= 12 && hour < 15) grouped[key].afternoon = {
                        time: presence.createdAt,
                        description: presence.description,
                        location: presence.location
                    };
                    else if (hour >= 15 && hour < 18) grouped[key].evening = {
                        time: presence.createdAt,
                        description: presence.description,
                        location: presence.location
                    };
                }
            }
        }

        const data = [];

        for (const dateStr of dateList) {
            const hasPresence = presences.some(employee => {
                const key = `${employee.id}|${dateStr}`;
                return grouped[key];
            });
        
            if (!hasPresence) {
                continue;
            }

            for (const employee of presences) {
                const key = `${employee.id}|${dateStr}`;
                if (grouped[key]) {
                    data.push(grouped[key]);
                } else {
                    data.push({
                        id: key,
                        name: employee.fullname,
                        date: dateStr,
                        morning: {
                            time: null,
                            description: null,
                            location: null
                        },
                        afternoon: {
                            time: null,
                            description: null,
                            location: null
                        },
                        evening: {
                            time: null,
                            description: null,
                            location: null
                        }
                    });
                }
            }
        }

        data.sort((a, b) => {
            if (a.date === b.date) return b.name.localeCompare(a.name);
            return b.date.localeCompare(a.date);
        });

        res.status(200).json({
            data: data,
            date_list: dateList,
            total: data.length
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.create = async (req, res) => {
    try {
        const presence = await PresenceModel.create({
            ...req.body,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        if (!presence) {
            return res.status(400).json({ message: 'Gagal menambahkan data' });
        }

        res.status(201).json({
            data: presence,
            message: 'Data absensi berhasil ditambahkan'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.update = async (req, res) => {
    try {
        const response = await PresenceModel.update(
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

        const updatedData = await PresenceModel.findOne({ where: { id: req.params.id } });

        res.status(200).json({
            data: updatedData,
            message: 'Data absensi berhasil diubah'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.delete = async (req, res) => {
    try {
        const dataDeleted = await PresenceModel.destroy({ where: { id: req.params.id } });
        if (dataDeleted === 0) {
            return res.status(400).json({ message: 'Gagal menghapus data' });
        }

        res.status(200).json({ message: 'Data absensi berhasil dihapus' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};