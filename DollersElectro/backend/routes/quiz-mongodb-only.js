const express = require('express');
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const UserQuiz = require('../models/UserQuiz');
const User = require('../models/User');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Helper function to add id field for MongoDB compatibility
const addIdField = (obj) => {
  if (obj && obj._id) {
    obj.id = obj._id.toString();
  }
  return obj;
};

// Helper function to process arrays
const processArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => addIdField(item));
};

// ==================== QUIZ MANAGEMENT (ADMIN) ====================

// GET all quizzes (admin)
router.get('/admin', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, category, difficulty, search } = req.query;
    const skip = (page - 1) * limit;
    
    let filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const quizzes = await Quiz.find(filter)
      .populate('questions', 'question type category difficulty points')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Quiz.countDocuments(filter);
    
    const processedQuizzes = quizzes.map(quiz => {
      const obj = quiz.toObject();
      addIdField(obj);
      if (obj.questions) obj.questions = processArray(obj.questions);
      if (obj.createdBy) obj.createdBy = addIdField(obj.createdBy);
      return obj;
    });
    
    res.json({
      success: true,
      data: {
        quizzes: processedQuizzes,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes' });
  }
});

// ==================== QUESTION MANAGEMENT (ADMIN) ====================

// GET all questions (admin)
router.get('/admin/questions', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    console.log('Questions endpoint called');
    const { page = 1, limit = 10, category, difficulty, type, search } = req.query;
    const skip = (page - 1) * limit;
    
    let filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;
    if (search) {
      filter.question = { $regex: search, $options: 'i' };
    }
    
    console.log('Filter:', filter);
    const questions = await Question.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    console.log('Questions found:', questions.length);
    const total = await Question.countDocuments(filter);
    
    const processedQuestions = questions.map(question => {
      const obj = question.toObject();
      addIdField(obj);
      if (obj.createdBy) obj.createdBy = addIdField(obj.createdBy);
      return obj;
    });
    
    res.json({
      success: true,
      data: {
        questions: processedQuestions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch questions' });
  }
});

// GET single quiz (admin)
router.get('/admin/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('questions')
      .populate('createdBy', 'firstName lastName email');
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    const obj = quiz.toObject();
    addIdField(obj);
    if (obj.questions) obj.questions = processArray(obj.questions);
    if (obj.createdBy) obj.createdBy = addIdField(obj.createdBy);
    
    res.json({
      success: true,
      data: { quiz: obj }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz' });
  }
});

// POST create quiz (admin)
router.post('/admin', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const quizData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const quiz = new Quiz(quizData);
    await quiz.save();
    
    const obj = quiz.toObject();
    addIdField(obj);
    
    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: { quiz: obj }
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to create quiz' });
  }
});

// PUT update quiz (admin)
router.put('/admin/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    const obj = quiz.toObject();
    addIdField(obj);
    
    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: { quiz: obj }
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to update quiz' });
  }
});

// DELETE quiz (admin)
router.delete('/admin/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    // Also delete related user quizzes
    await UserQuiz.deleteMany({ quiz: req.params.id });
    
    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete quiz' });
  }
});

// PATCH toggle quiz status (admin)
router.patch('/admin/:id/toggle-status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    quiz.isActive = !quiz.isActive;
    await quiz.save();
    
    const obj = quiz.toObject();
    addIdField(obj);
    
    res.json({
      success: true,
      message: `Quiz ${quiz.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { quiz: obj }
    });
  } catch (error) {
    console.error('Toggle quiz status error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle quiz status' });
  }
});

// POST create question (admin)
router.post('/admin/questions', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const questionData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const question = new Question(questionData);
    await question.save();
    
    const obj = question.toObject();
    addIdField(obj);
    
    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: { question: obj }
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ success: false, message: 'Failed to create question' });
  }
});

// PUT update question (admin)
router.put('/admin/questions/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    const obj = question.toObject();
    addIdField(obj);
    
    res.json({
      success: true,
      message: 'Question updated successfully',
      data: { question: obj }
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ success: false, message: 'Failed to update question' });
  }
});

// DELETE question (admin)
router.delete('/admin/questions/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    // Remove question from all quizzes
    await Quiz.updateMany(
      { questions: req.params.id },
      { $pull: { questions: req.params.id } }
    );
    
    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete question' });
  }
});

// Add question to quiz (admin)
router.post('/admin/:quizId/questions/:questionId', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    
    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    // Check if question is already in quiz
    if (quiz.questions.includes(questionId)) {
      return res.status(400).json({ success: false, message: 'Question already in quiz' });
    }
    
    // Add question to quiz
    quiz.questions.push(questionId);
    await quiz.save();
    
    res.json({
      success: true,
      message: 'Question added to quiz successfully'
    });
  } catch (error) {
    console.error('Add question to quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to add question to quiz' });
  }
});

// Remove question from quiz (admin)
router.delete('/admin/:quizId/questions/:questionId', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    
    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    // Remove question from quiz
    quiz.questions = quiz.questions.filter(id => id.toString() !== questionId);
    await quiz.save();
    
    res.json({
      success: true,
      message: 'Question removed from quiz successfully'
    });
  } catch (error) {
    console.error('Remove question from quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove question from quiz' });
  }
});

// ==================== USER QUIZ OPERATIONS ====================

// GET available quizzes for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    
    let filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    const quizzes = await Quiz.find(filter)
      .populate('questions', 'question type category difficulty points')
      .sort({ createdAt: -1 });
    
    const processedQuizzes = quizzes.map(quiz => {
      const obj = quiz.toObject();
      addIdField(obj);
      if (obj.questions) obj.questions = processArray(obj.questions);
      return obj;
    });
    
    res.json({
      success: true,
      data: { quizzes: processedQuizzes }
    });
  } catch (error) {
    console.error('Get available quizzes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes' });
  }
});

// GET single quiz for taking
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('questions', 'question type options points category difficulty');
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    if (!quiz.isActive) {
      return res.status(400).json({ success: false, message: 'Quiz is not available' });
    }
    
    const obj = quiz.toObject();
    addIdField(obj);
    if (obj.questions) obj.questions = processArray(obj.questions);
    
    res.json({
      success: true,
      data: { quiz: obj }
    });
  } catch (error) {
    console.error('Get quiz for taking error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz' });
  }
});

// POST start quiz
router.post('/:id/start', authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    if (!quiz.isActive) {
      return res.status(400).json({ success: false, message: 'Quiz is not available' });
    }
    
    // Check if user already has an incomplete attempt
    const existingAttempt = await UserQuiz.findOne({
      user: req.user.id,
      quiz: req.params.id,
      isCompleted: false
    });
    
    if (existingAttempt) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have an incomplete attempt for this quiz' 
      });
    }
    
    // Create new quiz attempt
    const userQuiz = new UserQuiz({
      user: req.user.id,
      quiz: req.params.id,
      startedAt: new Date()
    });
    
    await userQuiz.save();
    
    const obj = userQuiz.toObject();
    addIdField(obj);
    
    res.status(201).json({
      success: true,
      message: 'Quiz started successfully',
      data: { userQuiz: obj }
    });
  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to start quiz' });
  }
});

// POST submit quiz answers
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;
    
    const quiz = await Quiz.findById(req.params.id).populate('questions');
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    // Find or create user quiz attempt
    let userQuiz = await UserQuiz.findOne({
      user: req.user.id,
      quiz: req.params.id,
      isCompleted: false
    });
    
    if (!userQuiz) {
      userQuiz = new UserQuiz({
        user: req.user.id,
        quiz: req.params.id,
        startedAt: new Date()
      });
    }
    
    // Process answers and calculate score
    const processedAnswers = [];
    let totalPoints = 0;
    
    for (const answer of answers) {
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
      if (!question) continue;
      
      const isCorrect = JSON.stringify(answer.selectedAnswers.sort()) === 
                       JSON.stringify(question.correctAnswer.sort());
      
      const points = isCorrect ? question.points : 0;
      totalPoints += points;
      
      processedAnswers.push({
        question: question._id,
        selectedAnswers: answer.selectedAnswers,
        isCorrect,
        points,
        timeSpent: answer.timeSpent || 0
      });
      
      // Update question statistics
      await question.updateStats(isCorrect);
    }
    
    userQuiz.answers = processedAnswers;
    userQuiz.timeSpent = timeSpent || 0;
    userQuiz.calculateScore(quiz);
    await userQuiz.save();
    
    // Update quiz statistics
    await quiz.updateStats(userQuiz.score);
    
    // Update user statistics and points
    await updateUserQuizStats(req.user.id, userQuiz, totalPoints);
    
    const obj = userQuiz.toObject();
    addIdField(obj);
    
    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      data: { 
        userQuiz: obj,
        score: userQuiz.score,
        totalPoints: userQuiz.totalPoints,
        isPassed: userQuiz.isPassed
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit quiz' });
  }
});

// GET user's quiz history
router.get('/user/history', authenticateToken, async (req, res) => {
  try {
    console.log('Getting quiz history for user:', req.user.id);
    console.log('User ID type:', typeof req.user.id);
    console.log('User ID value:', req.user.id);
    
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // Convert user ID to ObjectId if it's a string
    const userId = mongoose.Types.ObjectId.isValid(req.user.id) 
      ? new mongoose.Types.ObjectId(req.user.id) 
      : req.user.id;
    
    console.log('Converted userId:', userId);
    
    console.log('Querying UserQuiz collection...');
    const userQuizzes = await UserQuiz.find({ 
      user: userId,
      isCompleted: true 
    })
      .populate('quiz', 'title category difficulty points')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    console.log('Found userQuizzes:', userQuizzes.length);
    
    const total = await UserQuiz.countDocuments({ 
      user: userId,
      isCompleted: true 
    });
    
    console.log('Total completed quizzes:', total);
    
    const processedUserQuizzes = userQuizzes.map(userQuiz => {
      const obj = userQuiz.toObject();
      addIdField(obj);
      if (obj.quiz) obj.quiz = addIdField(obj.quiz);
      return obj;
    });
    
    console.log('Processed userQuizzes:', processedUserQuizzes.length);
    
    res.json({
      success: true,
      data: {
        userQuizzes: processedUserQuizzes,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get user quiz history error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz history' });
  }
});

// GET user's quiz statistics
router.get('/user/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('quizStats quizPoints badges');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const obj = user.toObject();
    addIdField(obj);
    
    res.json({
      success: true,
      data: {
        quizStats: obj.quizStats,
        quizPoints: obj.quizPoints,
        badges: obj.badges
      }
    });
  } catch (error) {
    console.error('Get user quiz stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz statistics' });
  }
});

// Helper function to update user quiz statistics
async function updateUserQuizStats(userId, userQuiz, points) {
  const user = await User.findById(userId);
  if (!user) return;
  
  // Update basic stats
  user.quizStats.totalQuizzes += 1;
  user.quizStats.completedQuizzes += 1;
  if (userQuiz.isPassed) {
    user.quizStats.passedQuizzes += 1;
  }
  
  // Update average score
  const totalScore = user.quizStats.averageScore * (user.quizStats.completedQuizzes - 1) + userQuiz.score;
  user.quizStats.averageScore = Math.round(totalScore / user.quizStats.completedQuizzes);
  
  // Update time spent
  user.quizStats.totalTimeSpent += userQuiz.timeSpent / 60; // Convert to minutes
  
  // Update streak
  if (userQuiz.isPassed) {
    user.quizStats.currentStreak += 1;
    if (user.quizStats.currentStreak > user.quizStats.longestStreak) {
      user.quizStats.longestStreak = user.quizStats.currentStreak;
    }
  } else {
    user.quizStats.currentStreak = 0;
  }
  
  // Add points
  user.quizPoints += points;
  
  // Check for badge achievements
  await checkBadgeAchievements(user);
  
  await user.save();
}

// Helper function to check badge achievements
async function checkBadgeAchievements(user) {
  const badges = [];
  
  // First Quiz Badge
  if (user.quizStats.completedQuizzes === 1 && !user.badges.find(b => b.name === 'First Quiz')) {
    badges.push({
      name: 'First Quiz',
      description: 'Completed your first quiz!',
      icon: '🎯',
      category: 'Quiz'
    });
  }
  
  // Perfect Score Badge
  if (user.quizStats.averageScore === 100 && !user.badges.find(b => b.name === 'Perfect Score')) {
    badges.push({
      name: 'Perfect Score',
      description: 'Achieved a perfect score!',
      icon: '💯',
      category: 'Achievement'
    });
  }
  
  // Streak Badges
  if (user.quizStats.currentStreak >= 5 && !user.badges.find(b => b.name === 'Hot Streak')) {
    badges.push({
      name: 'Hot Streak',
      description: '5 quizzes in a row!',
      icon: '🔥',
      category: 'Achievement'
    });
  }
  
  // Points Badges
  if (user.quizPoints >= 100 && !user.badges.find(b => b.name === 'Century Club')) {
    badges.push({
      name: 'Century Club',
      description: 'Earned 100+ points!',
      icon: '💎',
      category: 'Achievement'
    });
  }
  
  // Add new badges
  if (badges.length > 0) {
    user.badges.push(...badges);
  }
}

module.exports = router;
