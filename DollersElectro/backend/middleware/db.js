const mongoose = require('mongoose');

// Ensure MongoDB is connected
const ensureMongoDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({
      success: false,
      message: 'Database connection not available'
    });
  }
  next();
};

module.exports = { ensureMongoDB };
