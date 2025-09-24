const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['multiple_choice', 'true_false', 'multiple_select']
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    explanation: {
      type: String,
      trim: true
    }
  }],
  correctAnswer: {
    type: [String], // Array for multiple select questions
    required: true
  },
  explanation: {
    type: String,
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
  points: {
    type: Number,
    default: 1
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  correctCount: {
    type: Number,
    default: 0
  },
  incorrectCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for success rate
questionSchema.virtual('successRate').get(function() {
  if (this.usageCount === 0) return 0;
  return (this.correctCount / this.usageCount) * 100;
});

// Add 'id' field to output
questionSchema.methods.addIdField = function() {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  return obj;
};

// Update statistics when question is answered
questionSchema.methods.updateStats = function(isCorrect) {
  this.usageCount += 1;
  if (isCorrect) {
    this.correctCount += 1;
  } else {
    this.incorrectCount += 1;
  }
  return this.save();
};

// Validate that correctAnswer matches the options
questionSchema.pre('save', function(next) {
  if (this.type === 'multiple_choice' || this.type === 'true_false') {
    const correctOptions = this.options.filter(option => option.isCorrect);
    if (correctOptions.length !== 1) {
      return next(new Error('Multiple choice and true/false questions must have exactly one correct option'));
    }
    this.correctAnswer = [correctOptions[0].text];
  } else if (this.type === 'multiple_select') {
    const correctOptions = this.options.filter(option => option.isCorrect);
    if (correctOptions.length < 2) {
      return next(new Error('Multiple select questions must have at least two correct options'));
    }
    this.correctAnswer = correctOptions.map(option => option.text);
  }
  next();
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
