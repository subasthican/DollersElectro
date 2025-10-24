const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Lighting', 'Tools', 'Electrical Panels', 'Cables', 'Switches', 'Sensors', 'Automation', 'Safety Equipment', 'Test Equipment', 'General']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  points: {
    type: Number,
    required: true,
    default: 10
  },
  timeLimit: {
    type: Number, // in minutes
    default: 15
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  passingScore: {
    type: Number,
    default: 70 // percentage
  },
  attempts: {
    type: Number,
    default: 0
  },
  completions: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for question count
quizSchema.virtual('questionCount').get(function() {
  return this.questions ? this.questions.length : 0;
});

// Virtual for completion rate
quizSchema.virtual('completionRate').get(function() {
  if (this.attempts === 0) return 0;
  return (this.completions / this.attempts) * 100;
});

// Add 'id' field to output
quizSchema.methods.addIdField = function() {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  return obj;
};

// Update statistics when quiz is completed
quizSchema.methods.updateStats = function(score) {
  this.attempts += 1;
  if (score >= this.passingScore) {
    this.completions += 1;
  }
  
  // Update average score
  const totalScore = this.averageScore * (this.attempts - 1) + score;
  this.averageScore = totalScore / this.attempts;
  
  return this.save();
};

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
