const { Newsletter, Notification, User } = require('../models');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

// Newsletter Controllers
const subscribeNewsletter = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    let subscriber = await Newsletter.findOne({ email });

    if (subscriber) {
      if (subscriber.isActive) {
        return res.status(400).json({
          success: false,
          message: 'This email is already subscribed'
        });
      } else {
        subscriber.isActive = true;
        subscriber.unsubscribeToken = crypto.randomBytes(32).toString('hex');
        await subscriber.save();
        return res.json({
          success: true,
          message: 'Welcome back! You have been resubscribed.'
        });
      }
    }

    const unsubscribeToken = crypto.randomBytes(32).toString('hex');
    
    subscriber = new Newsletter({
      email,
      unsubscribeToken
    });

    await subscriber.save();

    // Optionally send welcome email here (using emailService)

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to the newsletter!'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while subscribing'
    });
  }
};

const unsubscribeNewsletter = async (req, res) => {
  try {
    const { token } = req.params;
    
    const subscriber = await Newsletter.findOne({ unsubscribeToken: token });
    
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Invalid unsubscribe token'
      });
    }

    subscriber.isActive = false;
    await subscriber.save();

    res.json({
      success: true,
      message: 'Successfully unsubscribed from the newsletter'
    });
  } catch (error) {
    console.error('Newsletter unsubscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unsubscribing'
    });
  }
};

// Notification Controllers
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, unreadOnly } = req.query;
    const userId = req.user._id;

    const query = { user: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, user: userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notification'
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { 
        $set: { 
          isRead: true, 
          readAt: new Date() 
        } 
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notifications'
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({ _id: id, user: userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting notification'
    });
  }
};

module.exports = {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};