/**
 * Simple Rate Limiter Middleware
 * Protects against brute force attacks by limiting requests
 */

// In-memory store for tracking requests (use Redis in production for distributed systems)
const requestStore = new Map();

// Cleanup old entries periodically (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestStore.entries()) {
    if (now > value.resetTime) {
      requestStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} options.max - Max requests per window (default: 5)
 * @param {string} options.message - Error message when limit exceeded
 * @param {string} options.keyGenerator - Function to generate unique key (default: IP address)
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 5,
    message = 'Too many requests, please try again later.',
    keyGenerator = (req) => req.ip || req.connection.remoteAddress
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    if (!requestStore.has(key)) {
      // First request from this key
      requestStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    const record = requestStore.get(key);

    if (now > record.resetTime) {
      // Window has expired, reset counter
      record.count = 1;
      record.resetTime = now + windowMs;
      requestStore.set(key, record);
      return next();
    }

    if (record.count >= max) {
      // Limit exceeded
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        message: message,
        retryAfter: retryAfter
      });
    }

    // Increment counter
    record.count++;
    requestStore.set(key, record);
    next();
  };
};

// Predefined rate limiters for common use cases

// Strict limiter for login attempts (5 requests per 15 minutes per IP)
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again in 15 minutes.',
  keyGenerator: (req) => `login:${req.body.email || req.ip}`
});

// OTP verification limiter (10 attempts per 15 minutes per email)
const otpLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many OTP verification attempts. Please request a new code.',
  keyGenerator: (req) => `otp:${req.body.email || req.ip}`
});

// Password reset limiter (3 requests per hour per email)
const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset requests. Please try again in 1 hour.',
  keyGenerator: (req) => `reset:${req.body.email || req.ip}`
});

// OTP resend limiter (5 resends per hour per email)
const otpResendLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many OTP resend requests. Please wait before requesting a new code.',
  keyGenerator: (req) => `resend:${req.body.email || req.ip}`
});

// General API limiter (100 requests per 15 minutes per IP)
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP. Please try again later.'
});

// Registration limiter (3 registrations per hour per IP)
const registrationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many registration attempts. Please try again in 1 hour.'
});

module.exports = {
  createRateLimiter,
  loginLimiter,
  otpLimiter,
  passwordResetLimiter,
  otpResendLimiter,
  generalLimiter,
  registrationLimiter
};



