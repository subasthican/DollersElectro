const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// MongoDB Connection Setup
const mongoose = require('mongoose');

async function connectToMongoDB() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      console.error('❌ Please set MONGODB_URI in your .env file');
      process.exit(1);
    }
    
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds timeout
    });
    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log('🗄️  Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    return true;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
    console.error('❌ Cannot start server without MongoDB Atlas connection');
    process.exit(1);
  }
}

// MongoDB Only - No Local Database Fallback

// Initialize MongoDB connection
async function initializeDatabase() {
  await connectToMongoDB();
  console.log('✅ MongoDB Atlas initialization completed');
}

// Initialize database
initializeDatabase().catch(error => {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
});

// Basic middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple session and cookie handling
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'simple-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  },
  name: 'dollers_electro_session'
}));

// Session cleanup middleware
app.use((req, res, next) => {
  // Clean up old sessions (older than 24 hours)
  if (req.session && req.session.lastActivity) {
    const sessionAge = Date.now() - req.session.lastActivity;
    if (sessionAge > 24 * 60 * 60 * 1000) {
      req.session.destroy();
    }
  }
  next();
});

// Simple session tracking
app.use((req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      req.session.lastActivity = Date.now();
    }
  } catch (error) {
    console.error('Session tracking error:', error);
    // Continue without crashing
  }
  next();
});

// Routes - Order matters! More specific routes first
app.use('/api/admin/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/auth', require('./routes/auth-mongodb-only'));
app.use('/api/messages', require('./routes/messages'));
// app.use('/api/chat', require('./routes/chat'));
app.use('/api/ai-chat', require('./routes/aiChat'));
app.use('/api/promo-codes', require('./routes/promoCode'));
app.use('/api/products', require('./routes/products-mongodb-only'));
app.use('/api/orders', require('./routes/orders-mongodb-only'));
app.use('/api/users', require('./routes/users'));
app.use('/api/cart', require('./routes/cart-mongodb-only'));
app.use('/api/wishlist', require('./routes/wishlist-mongodb-only'));
app.use('/api/payments', require('./routes/payments-mongodb-only'));
app.use('/api/quiz', require('./routes/quiz-mongodb-only'));

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'DollersElectro Backend is running!',
    timestamp: new Date().toISOString(),
    database: 'MongoDB Atlas'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    session: req.session ? 'Active' : 'None',
    cookies: req.headers.cookie ? 'Present' : 'None'
  });
});

// Session info endpoint
app.get('/api/session-info', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    user: req.session.userId ? {
      id: req.session.userId,
      role: req.session.userRole
    } : null,
    lastActivity: req.session.lastActivity
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🗄️  Database: MongoDB Atlas`);
  console.log(`🍪 Session: Simple Session Management`);
});

// Better error handling for server
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please free the port and restart.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  server.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => {
    process.exit(1);
  });
});
