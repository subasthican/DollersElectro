const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Helper function to add id field
const addIdField = (obj) => {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(item => addIdField(item));
    } else {
      const newObj = { ...obj };
      if (newObj._id) {
        newObj.id = newObj._id.toString();
        delete newObj._id;
      }
      return newObj;
    }
  }
  return obj;
};

// POST /api/newsletter/subscribe - Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email, preferences = {}, source = 'website' } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email already exists
    let subscription = await Newsletter.findOne({ email: email.toLowerCase() });

    if (subscription) {
      if (subscription.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Email is already subscribed'
        });
      } else {
        // Reactivate subscription
        subscription.isActive = true;
        subscription.preferences = { ...subscription.preferences, ...preferences };
        subscription.source = source;
        subscription.ipAddress = ipAddress;
        subscription.userAgent = userAgent;
        subscription.bounceCount = 0;
        subscription.complaintCount = 0;
        await subscription.save();
      }
    } else {
      // Create new subscription
      subscription = new Newsletter({
        email: email.toLowerCase(),
        preferences: {
          productUpdates: preferences.productUpdates !== false,
          promotions: preferences.promotions !== false,
          news: preferences.news !== false,
          frequency: preferences.frequency || 'weekly'
        },
        source,
        ipAddress,
        userAgent,
        user: req.user?.id // If authenticated
      });

      await subscription.save();
    }

    // Generate verification token
    const verificationToken = subscription.generateVerificationToken();
    await subscription.save();

    // In a real application, you would send a verification email here
    // console.log(`Verification token for ${email}: ${verificationToken}`);

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: {
        subscription: addIdField(subscription),
        verificationRequired: true,
        verificationToken: verificationToken // Only for development
      }
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to newsletter'
    });
  }
});

// GET /api/newsletter/verify/:token - Verify subscription
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const subscription = await Newsletter.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!subscription) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    await subscription.verify();

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        subscription: addIdField(subscription)
      }
    });
  } catch (error) {
    console.error('Newsletter verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify subscription'
    });
  }
});

// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email && !token) {
      return res.status(400).json({
        success: false,
        message: 'Email or token is required'
      });
    }

    let subscription;
    if (token) {
      subscription = await Newsletter.findOne({ unsubscribeToken: token });
    } else {
      subscription = await Newsletter.findOne({ email: email.toLowerCase() });
    }

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    await subscription.unsubscribe();

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
      data: {
        subscription: addIdField(subscription)
      }
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from newsletter'
    });
  }
});

// PUT /api/newsletter/preferences - Update subscription preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { preferences } = req.body;
    const userId = req.user.id;

    const subscription = await Newsletter.findOne({ user: userId });
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Newsletter subscription not found'
      });
    }

    subscription.preferences = { ...subscription.preferences, ...preferences };
    await subscription.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        subscription: addIdField(subscription)
      }
    });
  } catch (error) {
    console.error('Newsletter preferences update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

// GET /api/newsletter/subscribers - Get all subscribers (admin only)
router.get('/subscribers', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'all',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = {};
    if (status !== 'all') {
      switch (status) {
        case 'active':
          filter.isActive = true;
          filter.isVerified = true;
          filter.bounceCount = { $lt: 3 };
          filter.complaintCount = 0;
          break;
        case 'pending':
          filter.isActive = true;
          filter.isVerified = false;
          break;
        case 'unsubscribed':
          filter.isActive = false;
          break;
        case 'bounced':
          filter.bounceCount = { $gte: 3 };
          break;
      }
    }

    if (search) {
      filter.email = { $regex: search, $options: 'i' };
    }

    const subscribers = await Newsletter.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalSubscribers = await Newsletter.countDocuments(filter);

    res.json({
      success: true,
      data: {
        subscribers: addIdField(subscribers),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSubscribers / parseInt(limit)),
          totalSubscribers,
          hasNext: skip + subscribers.length < totalSubscribers,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers'
    });
  }
});

// GET /api/newsletter/stats - Get newsletter statistics (admin only)
router.get('/stats', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const stats = await Newsletter.getStats();
    const activeSubscribers = await Newsletter.getActiveSubscribers();

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          total: 0,
          active: 0,
          pending: 0,
          unsubscribed: 0,
          bounced: 0
        },
        activeSubscribers: addIdField(activeSubscribers)
      }
    });
  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch newsletter statistics'
    });
  }
});

// POST /api/newsletter/send - Send newsletter (admin only)
router.post('/send', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { subject, content, type = 'general', targetAudience = 'all' } = req.body;

    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Subject and content are required'
      });
    }

    // Get target subscribers based on audience
    let subscribers;
    switch (targetAudience) {
      case 'active':
        subscribers = await Newsletter.getActiveSubscribers();
        break;
      case 'unverified':
        subscribers = await Newsletter.find({ 
          isActive: true, 
          isVerified: false 
        });
        break;
      default:
        subscribers = await Newsletter.find({ isActive: true });
    }

    // In a real application, you would integrate with an email service here
    // console.log(`Sending newsletter to ${subscribers.length} subscribers`);
    // console.log(`Subject: ${subject}`);
    // console.log(`Content: ${content}`);

    // Update last email sent for all subscribers
    await Newsletter.updateMany(
      { _id: { $in: subscribers.map(s => s._id) } },
      { lastEmailSent: new Date() }
    );

    res.json({
      success: true,
      message: `Newsletter sent to ${subscribers.length} subscribers`,
      data: {
        recipients: subscribers.length,
        subject,
        type,
        targetAudience
      }
    });
  } catch (error) {
    console.error('Newsletter send error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send newsletter'
    });
  }
});

// DELETE /api/newsletter/subscribers/:id - Delete subscriber (admin only)
router.delete('/subscribers/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Newsletter.findByIdAndDelete(id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      message: 'Subscriber deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscriber'
    });
  }
});

module.exports = router;


