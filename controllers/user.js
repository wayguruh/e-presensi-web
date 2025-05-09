const UserModel = require('../models').User;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

exports.auth = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await UserModel.findOne({ where: { username } });
        if (!user) {
            return res.status(400).json({ message: 'Username atau password salah!' });
        }

        if (user.status && user.status == 'Inactive') {
            return res.status(400).json({ message: 'Akun user telah dinonaktifkan!' });
        }
    
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Username atau password salah!' });
        }

        var token = 'Bearer ' + jwt.sign({
            id: user.id,
            role: user.role
        }, process.env.JWT_KEY, {
            expiresIn: 7776000
        });

        res.status(200).json({
            id: user.id,
            username: user.username,
            token: token,
            message: 'Login berhasil!'
        });
    } catch (error) {
        console.error('Error logging:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getById = async (req, res) => {
    try {
        const user = await UserModel.findByPk(req.params.id);
        if (!user) {
            return res.status(400).json({ message: 'Data tidak ditemukan' });
        }

        res.status(200).json({
            data: user,
            message: 'Data berhasil diambil'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.create = async (req, res) => {
    try {
        const user = await UserModel.create({
            ...req.body,
            id: uuidv4(),
            password: bcrypt.hashSync(req.body.password, 10),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        if (!user) {
            return res.status(400).json({ message: 'Gagal menambahkan data' });
        }

        res.status(201).json({ 
            data: user,
            message: 'Data user berhasil ditambahkan'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.update = async (req, res) => {
    try {
        let data;
        if (req.body.password) {
            data = {
                ...req.body,
                password: bcrypt.hashSync(req.body.password, 10),
                updatedAt: new Date()
            }
        } else {
            data = {
                ...req.body,
                updatedAt: new Date()
            }
        }

        const response = await UserModel.update(
            data,
            {
                where: { id: req.params.id }
            }
        );
        if (response === 0) {
            return res.status(400).json({ message: 'Gagal mengubah data' });
        }

        const updatedData = await UserModel.findOne({ where: { id: req.params.id } });

        res.status(200).json({
            data: updatedData,
            message: 'Data user berhasil diubah'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { password, newPassword } = req.body;

        const user = await UserModel.findOne({ where: { id: req.params.id } });
        if (!user) {
            return res.status(400).json({ message: 'Data user tidak ditemukan!' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Password salah!' });
        }

        const response = await UserModel.update(
            {
                password: bcrypt.hashSync(newPassword, 10),
                updatedAt: new Date()
            },
            {
                where: { id: req.params.id }
            }
        );
        if (response === 0) {
            return res.status(400).json({ message: 'Gagal mengubah password' });
        }

        res.status(200).json({
            message: 'Password berhasil diubah'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.delete = async (req, res) => {
    try {
        const dataDeleted = await UserModel.destroy({ where: { id: req.params.id } });
        if (dataDeleted === 0) {
            return res.status(400).json({ message: 'Gagal menghapus data' });
        }

        res.status(200).json({ message: 'Data user berhasil dihapus' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};