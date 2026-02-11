const express = require('express');
const { getDashboardStats, getAuditLogs, getUsers } = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const adminLimiter = require('../middleware/adminLimiter');

const router = express.Router();

// Apply admin rate limiter and middleware to all routes
router.use(adminLimiter);
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/dashboard', getDashboardStats);
router.get('/logs', getAuditLogs);
router.get('/users', getUsers);

module.exports = router;