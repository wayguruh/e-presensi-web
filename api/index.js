const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;;
require('dotenv').config({ path: '.env' });
const { default: Redis } = require('ioredis');

const redis = new Redis(process.env.REDIS_URL)

const middleware = require('../middleware/authorization');

const userController = require('../controllers/user');
const employeeController = require('../controllers/employee');
const presenceController = require('../controllers/presence');
const timeOffController = require('../controllers/timeoff');

app.use(express.json());
app.use(cors());

const apiRouter = express.Router();

apiRouter.post('/auth', userController.auth);

apiRouter.use(middleware.authMiddleware);

apiRouter.get('/open', async (req, res) => {
    const isOpen = await redis.get('isOpen');
    res.status(200).json({
        data: isOpen
    });
});

apiRouter.get('/user/:id', userController.getById);
apiRouter.put('/user/:id', userController.update);
apiRouter.put('/change-password/:id', userController.updatePassword);

apiRouter.get('/employees', employeeController.getAll);
apiRouter.get('/total-employees', employeeController.getTotal);
apiRouter.get('/employee/:id', employeeController.getById);
apiRouter.put('/employee/:id', employeeController.update);

apiRouter.get('/presences', presenceController.getAll);
apiRouter.get('/total-presences', presenceController.getTotalPresence);
apiRouter.post('/presence', presenceController.create);

apiRouter.get('/timeoffs', timeOffController.getAll);
apiRouter.get('/total-timeoffs', timeOffController.getTotalTimeoffDays);
apiRouter.get('/timeoff/:id', timeOffController.getById);
apiRouter.post('/timeoff', timeOffController.create);

// ADMIN ROUTES
apiRouter.use(middleware.adminMiddleware);

apiRouter.put('/open', async (req, res) => {
    const { status } = req.query;

    if (status != null) {
        await redis.set('isOpen', status);
        res.status(200).json({
            data: status,
            message: 'Tombol berhasil diaktifkan'
        });
    } else {
        res.status(400).json({
            data: isOpen,
            message: 'Tombol gagal diaktifkan'
        });
    }
});

apiRouter.post('/user', userController.create);
apiRouter.delete('/user/:id', userController.delete);

apiRouter.post('/employee', employeeController.create);
apiRouter.delete('/employee/:id', employeeController.delete);
apiRouter.delete('/employees', employeeController.bulkDelete);

apiRouter.get('/presence-recap', presenceController.getPresenceRecap);
apiRouter.put('/presence/:id', presenceController.update);
apiRouter.delete('/presence/:id', presenceController.delete);

apiRouter.put('/timeoff/:id', timeOffController.update);
apiRouter.delete('/timeoff/:id', timeOffController.delete);
apiRouter.delete('/timeoffs', timeOffController.bulkDelete);

app.use('/api', apiRouter);

app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});

module.exports = app;