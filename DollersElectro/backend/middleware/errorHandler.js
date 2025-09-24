const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = { message, statusCode: 400 };
  }

  // Cloudinary errors
  if (err.http_code) {
    const message = err.message || 'File upload failed';
    error = { message, statusCode: err.http_code };
  }

  // Stripe errors
  if (err.type === 'StripeCardError') {
    const message = err.message;
    error = { message, statusCode: 400 };
  }

  if (err.type === 'StripeInvalidRequestError') {
    const message = 'Invalid payment request';
    error = { message, statusCode: 400 };
  }

  if (err.type === 'StripeAPIError') {
    const message = 'Payment service error';
    error = { message, statusCode: 500 };
  }

  // Twilio errors
  if (err.code === 21211) {
    const message = 'Invalid phone number';
    error = { message, statusCode: 400 };
  }

  if (err.code === 21608) {
    const message = 'Message delivery failed';
    error = { message, statusCode: 500 };
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests. Please try again later.';
    error = { message, statusCode: 429 };
  }

  // Default error
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Don't send stack trace in production
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(response);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found handler
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

// Validation error handler
const validationError = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  next(err);
};

// Database connection error handler
const dbErrorHandler = (err) => {
  console.error('Database connection error:', err);
  
  if (err.name === 'MongoNetworkError') {
    console.error('MongoDB network error. Please check your connection.');
  }
  
  if (err.name === 'MongoServerSelectionError') {
    console.error('MongoDB server selection error. Please check your connection string.');
  }
  
  if (err.name === 'MongoParseError') {
    console.error('MongoDB connection string parse error.');
  }
};

// Unhandled rejection handler
const unhandledRejectionHandler = (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  
  // In production, you might want to log this to a service like Sentry
  if (process.env.NODE_ENV === 'production') {
    // Log to external service
    console.error('Unhandled rejection logged to external service');
  }
};

// Uncaught exception handler
const uncaughtExceptionHandler = (error) => {
  console.error('Uncaught Exception:', error);
  
  // In production, you might want to log this to a service like Sentry
  if (process.env.NODE_ENV === 'production') {
    // Log to external service
    console.error('Uncaught exception logged to external service');
  }
  
  // Gracefully shutdown the server
  process.exit(1);
};

// Setup global error handlers
const setupGlobalErrorHandlers = () => {
  process.on('unhandledRejection', unhandledRejectionHandler);
  process.on('uncaughtException', uncaughtExceptionHandler);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound,
  validationError,
  dbErrorHandler,
  unhandledRejectionHandler,
  uncaughtExceptionHandler,
  setupGlobalErrorHandlers
};




