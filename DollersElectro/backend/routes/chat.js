const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { authenticateToken, requireRole } = require('../middleware/auth');

// @route   GET /api/chat/messages/:messageId
// @desc    Get real-time message updates with typing indicators
// @access  Private
router.get('/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.getMessagesWithUsers({ _id: messageId });
    
    if (!message || message.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const messageData = message[0];

    // Check if user can access this message
    if (req.userRole === 'customer' && messageData.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get active typing users
    const activeTypingUsers = messageData.getActiveTypingUsers();
    const typingUsers = await Message.populate(activeTypingUsers, {
      path: 'user',
      select: 'firstName lastName username role'
    });

    res.json({
      success: true,
      data: {
        message: messageData,
        typingUsers: typingUsers.map(t => ({
          user: t.user,
          startedAt: t.startedAt
        }))
      }
    });

  } catch (error) {
    console.error('Get chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message'
    });
  }
});

// @route   POST /api/chat/messages/:messageId/typing
// @desc    Update typing status
// @access  Private
router.post('/messages/:messageId/typing', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { isTyping } = req.body;
    const userId = req.userId;

    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user can access this message
    if (req.userRole === 'customer' && message.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await message.updateTypingStatus(userId, isTyping);

    res.json({
      success: true,
      message: 'Typing status updated'
    });

  } catch (error) {
    console.error('Update typing status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update typing status'
    });
  }
});

// @route   GET /api/chat/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    console.log(`📬 Fetching notifications for user: ${userId}`);
    console.log(`   Page: ${page}, Limit: ${limit}, Unread Only: ${unreadOnly}`);

    const filter = { recipient: userId };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find(filter)
      .populate('message', 'subject status priority')
      .populate('recipient', 'firstName lastName username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`   Found ${notifications.length} notifications for user ${userId}`);
    console.log(`   Types: ${notifications.map(n => n.type).join(', ')}`);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.getUnreadCount(userId);
    
    console.log(`   Total: ${total}, Unread: ${unreadCount}`);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// @route   PUT /api/chat/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await Notification.findOne({ _id: id, recipient: userId });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// @route   PUT /api/chat/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: Date.now() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read'
    });
  }
});

module.exports = router;



