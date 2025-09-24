const mongoose = require('mongoose');

const userQuizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedAnswers: [{
      type: String,
      required: true
    }],
    isCorrect: {
      type: Boolean,
      required: true
    },
    points: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    }
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalPoints: {
    type: Number,
    required: true,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isPassed: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  attempts: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for completion time in minutes
userQuizSchema.virtual('completionTimeMinutes').get(function() {
  return Math.round(this.timeSpent / 60 * 100) / 100;
});

// Add 'id' field to output
userQuizSchema.methods.addIdField = function() {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  return obj;
};

// Calculate score and points
userQuizSchema.methods.calculateScore = function(quiz) {
  let correctAnswers = 0;
  let totalPoints = 0;
  
  this.answers.forEach(answer => {
    if (answer.isCorrect) {
      correctAnswers++;
      totalPoints += answer.points;
    }
  });
  
  this.score = Math.round((correctAnswers / this.answers.length) * 100);
  this.totalPoints = totalPoints;
  this.isPassed = this.score >= quiz.passingScore;
  this.completedAt = new Date();
  this.isCompleted = true;
  
  return this;
};

// Index for efficient queries
userQuizSchema.index({ user: 1, quiz: 1 });
userQuizSchema.index({ user: 1, isCompleted: 1 });
userQuizSchema.index({ quiz: 1, isCompleted: 1 });

const UserQuiz = mongoose.model('UserQuiz', userQuizSchema);

module.exports = UserQuiz;
