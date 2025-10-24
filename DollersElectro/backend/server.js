const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Logging
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'combined.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dollerselectro';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  console.log(`📦 Database: ${mongoose.connection.name}`);
  console.log(`🌐 Host: ${mongoose.connection.host}`);
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'DollersElectro Backend is running!',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import routes
const authRoutes = require('./routes/auth-mongodb-only');
const productsRoutes = require('./routes/products-mongodb-only');
const categoriesRoutes = require('./routes/categories-mongodb-only');
const cartRoutes = require('./routes/cart-mongodb-only');
const ordersRoutes = require('./routes/orders-mongodb-only');
const paymentsRoutes = require('./routes/payments-mongodb-only');
const wishlistRoutes = require('./routes/wishlist-mongodb-only');
const reviewsRoutes = require('./routes/reviews-mongodb-only');
const quizRoutes = require('./routes/quiz-mongodb-only');
const promoCodeRoutes = require('./routes/promoCode');
const messagesRoutes = require('./routes/messages');
const chatRoutes = require('./routes/chat');
const aiChatRoutes = require('./routes/aiChat');
const analyticsRoutes = require('./routes/analytics');
const usersRoutes = require('./routes/users-mongodb-only');
const adminRoutes = require('./routes/admin');
const newsletterRoutes = require('./routes/newsletter-mongodb-only');
const lowStockAlertsRoutes = require('./routes/lowStockAlerts-mongodb-only');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/promo-codes', promoCodeRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/low-stock-alerts', lowStockAlertsRoutes);

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 DollersElectro Backend Server Started!');
  console.log('='.repeat(60));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Database: ${mongoose.connection.name}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

module.exports = app;

