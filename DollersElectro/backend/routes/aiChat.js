const express = require('express');
const router = express.Router();
const AIChat = require('../models/AIChat');
const { authenticateToken } = require('../middleware/auth');
const { generateAIResponse, generateRecommendations, updateContext } = require('../services/aiService');

// Start new chat session
router.post('/start', async (req, res) => {
  try {
    const sessionId = AIChat.generateSessionId();
    const aiChat = new AIChat({
      sessionId,
      userId: req.userId || null
    });
    
    const welcomeMessage = {
      role: 'assistant',
      message: "Hi! I'm your AI electrical advisor. I can help you find the perfect electrical products for your project. What are you working on?",
      suggestions: [
        { text: "Building a new house", action: "project_type", data: "house" },
        { text: "Renovating existing space", action: "project_type", data: "renovation" },
        { text: "Office setup", action: "project_type", data: "office" },
        { text: "Smart home upgrade", action: "project_type", data: "smart_home" }
      ],
      timestamp: new Date()
    };
    
    aiChat.conversation.push(welcomeMessage);
    await aiChat.save();
    
    res.json({
      success: true,
      data: { sessionId, conversation: aiChat.conversation }
    });
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({ success: false, message: 'Failed to start chat session' });
  }
});

// Send message and get AI response
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and message are required'
      });
    }
    
    const aiChat = await AIChat.findOne({ sessionId });
    
    if (!aiChat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    // Add user message
    aiChat.conversation.push({
      role: 'user',
      message,
      timestamp: new Date()
    });
    
    // Generate AI response using simple AI service
    const aiResponse = await generateAIResponse(message, aiChat.context);
    aiChat.conversation.push({
      role: 'assistant',
      message: aiResponse.message,
      suggestions: aiResponse.suggestions,
      timestamp: new Date()
    });
    
    // Update context and generate recommendations
    await updateContext(aiChat, message);
    const recommendations = await generateRecommendations(aiChat);
    aiChat.recommendations = recommendations;
    
    aiChat.lastActivity = new Date();
    await aiChat.save();
    
    res.json({
      success: true,
      data: {
        conversation: aiChat.conversation,
        recommendations: aiChat.recommendations
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
    });
  }
});

// Get chat history
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const aiChat = await AIChat.findOne({ sessionId });
    
    if (!aiChat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    res.json({
      success: true,
      data: aiChat
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat session'
    });
  }
});

// Get user's chat sessions (if authenticated)
router.get('/my-sessions', authenticateToken, async (req, res) => {
  try {
    const aiChats = await AIChat.find({ userId: req.userId })
      .sort({ lastActivity: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: aiChats
    });
  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user sessions'
    });
  }
});

// Delete chat session
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const aiChat = await AIChat.findOne({ sessionId });
    
    if (!aiChat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    // Only allow deletion if user owns the session or it's anonymous
    if (aiChat.userId && aiChat.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await AIChat.findByIdAndDelete(aiChat._id);
    
    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat session'
    });
  }
});

// Get chat analytics (for admin purposes)
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (you can add role check here)
    
    const totalSessions = await AIChat.countDocuments();
    const activeSessions = await AIChat.countDocuments({
      lastActivity: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    const projectTypes = await AIChat.aggregate([
      { $match: { 'context.projectType': { $exists: true } } },
      { $group: { _id: '$context.projectType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalSessions,
        activeSessions,
        projectTypes
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

module.exports = router;
