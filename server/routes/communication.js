const express = require('express');
const { body, param } = require('express-validator');
const {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/communicationController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation
const subscribeValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

// Newsletter Routes (Public)
router.post('/newsletter/subscribe', subscribeValidation, subscribeNewsletter);
router.get('/newsletter/unsubscribe/:token', unsubscribeNewsletter);

// Notification Routes (Protected)
router.get('/notifications', authMiddleware, getNotifications);
router.put('/notifications/mark-all-read', authMiddleware, markAllAsRead);
router.put('/notifications/:id/read', authMiddleware, markAsRead);
router.delete('/notifications/:id', authMiddleware, deleteNotification);

module.exports = router;