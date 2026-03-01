const express = require('express');
const router = express.Router();
const {
    getAllDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getAllStaff,
    createStaff,
    getDashboardStats,
} = require('../controllers/userController');
const { verifyToken } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');

// All routes require authentication + admin role
router.use(verifyToken, checkRole('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// Doctor management
router.get('/doctors', getAllDoctors);
router.post('/doctors', createDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);

// Staff (receptionist) management
router.get('/staff', getAllStaff);
router.post('/staff', createStaff);

module.exports = router;
