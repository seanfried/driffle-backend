const express = require('express');
const { createSubscription, getMySubscription } = require('../controllers/subscriptionController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/subscriptions', authMiddleware, createSubscription);
router.get('/subscriptions/me', authMiddleware, getMySubscription);

module.exports = router;