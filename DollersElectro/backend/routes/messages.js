const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { authenticateToken, requireAuth, requireRole } = require('../middleware/auth');

// @route   POST /api/messages/contact
// @desc    Send a contact message (requires login)
// @access  Private (authenticated users only)
router.post('/contact', authenticateToken, async (req, res) => {
  try {
    const { subject, message, category = 'general', priority = 'medium' } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    // Create new message
    const newMessage = new Message({
      subject,
      message,
      user: userId,
      category,
      priority
    });

    await newMessage.save();

    // Populate user details for response
    await newMessage.populate('user', 'firstName lastName email username');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: {
        message: newMessage
      }
    });

  } catch (error) {
    console.error('Contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again.'
    });
  }
});

// @route   GET /api/messages/my-messages
// @desc    Get user's own messages
// @access  Private (authenticated users only)
router.get('/my-messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const messages = await Message.getMessagesWithUsers({ user: userId });

    res.json({
      success: true,
      data: {
        messages
      }
    });

  } catch (error) {
    console.error('Get my messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// @route   GET /api/messages/:id
// @desc    Get specific message details
// @access  Private (authenticated users only)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.userId;
    const userRole = req.userRole;

    const message = await Message.getMessagesWithUsers({ _id: messageId });

    if (!message || message.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const messageData = message[0];

    // Check if user can access this message
    if (userRole === 'customer' && messageData.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        message: messageData
      }
    });

  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message'
    });
  }
});

// @route   POST /api/messages/:id/reply
// @desc    Reply to a message
// @access  Private (authenticated users only)
router.post('/:id/reply', authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.id;
    const { message: replyMessage, isInternal = false } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    if (!replyMessage) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check permissions
    if (userRole === 'customer') {
      // Customers can only reply to their own messages
      if (message.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Add reply
    await message.addReply(userId, replyMessage, isInternal);

    // Create notification for the customer if reply is not internal
    if (!isInternal && userRole !== 'customer') {
      await Notification.createNotification({
        recipient: message.user,
        type: 'message_reply',
        message: messageId,
        title: 'New Reply to Your Message',
        content: `You have received a reply to your message: "${message.subject}"`,
        priority: message.priority,
        actionData: {
          messageId: messageId,
          action: 'view_message'
        }
      });
    }

    // Populate user details
    await message.populate('user', 'firstName lastName email username');
    await message.populate('replies.user', 'firstName lastName email username role');

    res.json({
      success: true,
      message: 'Reply sent successfully!',
      data: {
        message
      }
    });

  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply'
    });
  }
});

// @route   POST /api/messages/:id/internal-note
// @desc    Add internal note (admin/employee only)
// @access  Private (admin/employee only)
router.post('/:id/internal-note', authenticateToken, requireRole(['admin', 'employee']), async (req, res) => {
  try {
    const messageId = req.params.id;
    const { note } = req.body;
    const userId = req.userId;

    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Note is required'
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Add internal note
    await message.addInternalNote(userId, note);

    res.json({
      success: true,
      message: 'Internal note added successfully!',
      data: {
        message
      }
    });

  } catch (error) {
    console.error('Internal note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add internal note'
    });
  }
});

// @route   PUT /api/messages/:id/assign
// @desc    Assign message to admin/employee
// @access  Private (admin only)
router.put('/:id/assign', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const messageId = req.params.id;
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Assigned user ID is required'
      });
    }

    const message = await Message.findByIdAndUpdate(
      messageId,
      { assignedTo },
      { new: true }
    ).populate('assignedTo', 'firstName lastName email username');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message assigned successfully!',
      data: {
        message
      }
    });

  } catch (error) {
    console.error('Assign message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign message'
    });
  }
});

// @route   PUT /api/messages/:id/status
// @desc    Update message status
// @access  Private (admin/employee only)
router.put('/:id/status', authenticateToken, requireRole(['admin', 'employee']), async (req, res) => {
  try {
    const messageId = req.params.id;
    const { status } = req.body;

    if (!status || !['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    const message = await Message.findByIdAndUpdate(
      messageId,
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully!',
      data: {
        message
      }
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
});

// @route   GET /api/chat/active-count
// @desc    Get count of active chat sessions (employee/admin)
// @access  Private (employee/admin)
router.get('/chat/active-count', authenticateToken, async (req, res) => {
  try {
    // Check if user is employee or admin
    if (req.userRole !== 'employee' && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    // For now, return a mock count since we don't have a chat system implemented
    // In a real implementation, this would count active chat sessions
    const count = 0;
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get active chat count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active chat count'
    });
  }
});

// @route   GET /api/support/pending-count
// @desc    Get count of pending support messages (employee/admin)
// @access  Private (employee/admin)
router.get('/support/pending-count', authenticateToken, async (req, res) => {
  try {
    // Check if user is employee or admin
    if (req.userRole !== 'employee' && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    const count = await Message.countDocuments({ status: 'open' });
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get pending support count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending support count'
    });
  }
});

// @route   PUT /api/messages/:id
// @desc    Update own message (customer only, before resolved/closed)
// @access  Private (authenticated users only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.id;
    const { subject, message: messageText, category, priority } = req.body;
    const userId = req.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user owns this message
    if (message.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    // Check if message is still editable (not resolved or closed)
    if (message.status === 'resolved' || message.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit resolved or closed messages'
      });
    }

    // Save edit history before updating
    message.editHistory.push({
      editedAt: new Date(),
      previousSubject: message.subject,
      previousMessage: message.message,
      previousCategory: message.category,
      previousPriority: message.priority
    });

    // Update message fields
    if (subject) message.subject = subject;
    if (messageText) message.message = messageText;
    if (category) message.category = category;
    if (priority) message.priority = priority;
    message.updatedAt = new Date();

    await message.save();

    // Populate user details
    await message.populate('user', 'firstName lastName email username');

    res.json({
      success: true,
      message: 'Message updated successfully!',
      data: {
        message
      }
    });

  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message'
    });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete own message (customer only, before resolved/closed)
// @access  Private (authenticated users only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user owns this message
    if (message.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    // Check if message is still deletable (not resolved or closed)
    if (message.status === 'resolved' || message.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete resolved or closed messages'
      });
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    res.json({
      success: true,
      message: 'Message deleted successfully!'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

module.exports = router;
