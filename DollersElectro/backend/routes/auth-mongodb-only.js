const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { validateUserRegistration, validateUserLogin, sanitizeHtml } = require('../middleware/validation');
const logger = require('../utils/logger');
const { generateOTP, sendLoginOTP, sendPasswordResetOTP, sendWelcomeEmail } = require('../services/emailService');
const { createOTPData, isOTPExpired, isOTPAttemptsExceeded, isValidOTPFormat, incrementOTPAttempts, getRemainingAttempts, cleanOTPCode } = require('../utils/otpUtils');
const { loginLimiter, otpLimiter, passwordResetLimiter, otpResendLimiter, registrationLimiter } = require('../middleware/rateLimiter');

// Ensure MongoDB is connected
const ensureMongoDB = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection required');
  }
};

// POST /api/auth/register - Register new user
router.post('/register', registrationLimiter, sanitizeHtml, validateUserRegistration, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { firstName, lastName, email, password, role = 'customer' } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      isEmailVerified: false,
      isTwoFactorEnabled: false,
      isActive: true,
      isTemporaryPassword: false, // User set their own password during registration
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await user.save();

    // Validate required environment variables
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email 
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          _id: user._id, // Add _id for MongoDB compatibility
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    logger.error('Registration error:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to register user'
    });
  }
});

// POST /api/auth/login - Step 1: Validate credentials and send OTP
router.post('/login', loginLimiter, sanitizeHtml, validateUserLogin, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log(`✅ Password verified for ${email}`);
    console.log(`📝 User isTemporaryPassword: ${user.isTemporaryPassword}`);

    // If user has temporary password, skip OTP and return special flag
    if (user.isTemporaryPassword) {
      console.log(`🔐 User has temporary password, skipping OTP for ${email}`);
      
      // Generate a special token for password change
      const changePasswordToken = jwt.sign(
        { 
          id: user._id, 
          email: user.email,
          purpose: 'force_password_change'
        },
        process.env.JWT_SECRET,
        { expiresIn: '30m' }
      );

      return res.json({
        success: true,
        message: 'Please change your temporary password',
        data: {
          requiresPasswordChange: true,
          changePasswordToken,
          user: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          }
        }
      });
    }

    // Normal flow: Generate and send OTP
    const otpCode = generateOTP();
    
    // Save OTP to user record
    user.loginOTP = createOTPData(otpCode);
    await user.save();

    // Send OTP via email
    const emailResult = await sendLoginOTP(email, otpCode, user.firstName);
    
    console.log(`📧 Login OTP sent to ${email}: ${otpCode} (${emailResult.simulated ? 'SIMULATED' : 'SENT'})`);

    res.json({
      success: true,
      message: 'Verification code sent to your email',
      data: {
        email: user.email,
        requiresOTP: true,
        otpSent: true,
        // Include OTP in development/simulated mode for testing
        ...(emailResult.simulated && { devOTP: otpCode })
      }
    });

  } catch (error) {
    logger.error('Login error:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to process login request'
    });
  }
});

// POST /api/auth/verify-login-otp - Step 2: Verify OTP and complete login
router.post('/verify-login-otp', otpLimiter, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Clean OTP code (remove spaces, non-digits)
    const cleanedOTP = cleanOTPCode(otp);

    // Validate OTP format
    if (!isValidOTPFormat(cleanedOTP)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format. Must be 6 digits.'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if OTP exists
    if (!user.loginOTP || !user.loginOTP.code) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.'
      });
    }

    // Check if OTP is expired
    if (isOTPExpired(user.loginOTP.expires)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check if attempts exceeded
    if (isOTPAttemptsExceeded(user.loginOTP.attempts, user.loginOTP.maxAttempts)) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (user.loginOTP.code !== cleanedOTP) {
      // Increment attempt counter
      user.loginOTP = incrementOTPAttempts(user.loginOTP);
      await user.save();

      const remaining = getRemainingAttempts(user.loginOTP.attempts, user.loginOTP.maxAttempts);
      
      return res.status(401).json({
        success: false,
        message: `Invalid OTP. ${remaining} attempt(s) remaining.`,
        remainingAttempts: remaining
      });
    }

    // OTP is valid! Clear OTP data
    user.loginOTP = {
      code: null,
      expires: null,
      attempts: 0,
      maxAttempts: 5
    };

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Validate required environment variables
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email 
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ Login successful for ${email}`);
    console.log(`📝 User isTemporaryPassword: ${user.isTemporaryPassword}`);
    console.log(`📝 User role: ${user.role}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
          isTemporaryPassword: user.isTemporaryPassword,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    logger.error('Verify OTP error:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

// POST /api/auth/resend-login-otp - Resend login OTP
router.post('/resend-login-otp', otpResendLimiter, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new OTP
    const otpCode = generateOTP();
    
    // Save new OTP to user record
    user.loginOTP = createOTPData(otpCode);
    await user.save();

    // Send OTP via email
    const emailResult = await sendLoginOTP(email, otpCode, user.firstName);
    
    console.log(`📧 Login OTP resent to ${email}: ${otpCode} (${emailResult.simulated ? 'SIMULATED' : 'SENT'})`);

    res.json({
      success: true,
      message: 'New verification code sent to your email',
      data: {
        otpSent: true,
        // Include OTP in development/simulated mode for testing
        ...(emailResult.simulated && { devOTP: otpCode })
      }
    });

  } catch (error) {
    logger.error('Resend OTP error:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', async (req, res) => {
  try {
    ensureMongoDB();
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Validate required environment variables
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Token verification failed',
        code: 'TOKEN_ERROR'
      });
    }
    
    // Get user from MongoDB
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          _id: user._id, // Add _id for MongoDB compatibility
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    logger.error('Get user error:', { error: error.message, stack: error.stack });
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// POST /api/auth/refresh - Refresh token
router.post('/refresh', async (req, res) => {
  try {
    ensureMongoDB();
    
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Validate required environment variables
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get user from MongoDB
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        accessToken
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', async (req, res) => {
  try {
    // In a real application, you would invalidate the token
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout'
    });
  }
});

// POST /api/auth/force-change-password - Force password change for temporary passwords
router.post('/force-change-password', async (req, res) => {
  try {
    ensureMongoDB();
    
    const { newPassword } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }
    
    // Verify token and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('🔍 Decoded token:', decoded);
    
    // Check if token is for password change
    if (decoded.purpose !== 'force_password_change') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token purpose'
      });
    }
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.log('❌ User not found for ID:', decoded.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('✅ User found:', user.email, 'isTemporaryPassword:', user.isTemporaryPassword);
    
    // Check if user has temporary password
    if (!user.isTemporaryPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password change not required'
      });
    }
    
    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('🔐 Hashing new password...');
    
    // Update user password and remove temporary flag
    user.password = hashedPassword;
    user.isTemporaryPassword = false;
    user.passwordChangedAt = new Date();
    await user.save();
    
    console.log('✅ Password changed successfully for:', user.email);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('❌ Force password change error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// POST /api/auth/forgot-password - Send password reset OTP
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset code has been sent.'
      });
    }

    // Generate 6-digit OTP
    const otpCode = generateOTP();
    
    // Save OTP to user record
    user.passwordResetOTP = createOTPData(otpCode);
    await user.save();

    // Send OTP via email
    const emailResult = await sendPasswordResetOTP(email, otpCode, user.firstName);
    
    console.log(`📧 Password reset OTP sent to ${email}: ${otpCode} (${emailResult.simulated ? 'SIMULATED' : 'SENT'})`);

    res.json({
      success: true,
      message: 'Password reset code sent to your email',
      data: {
        otpSent: true,
        // Include OTP in development/simulated mode for testing
        ...(emailResult.simulated && { devOTP: otpCode })
      }
    });

  } catch (error) {
    logger.error('Forgot password error:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to process request'
    });
  }
});

// POST /api/auth/verify-reset-otp - Verify password reset OTP
router.post('/verify-reset-otp', otpLimiter, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Clean OTP code
    const cleanedOTP = cleanOTPCode(otp);

    // Validate OTP format
    if (!isValidOTPFormat(cleanedOTP)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format. Must be 6 digits.'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP exists
    if (!user.passwordResetOTP || !user.passwordResetOTP.code) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.'
      });
    }

    // Check if OTP is expired
    if (isOTPExpired(user.passwordResetOTP.expires)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check if attempts exceeded
    if (isOTPAttemptsExceeded(user.passwordResetOTP.attempts, user.passwordResetOTP.maxAttempts)) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (user.passwordResetOTP.code !== cleanedOTP) {
      // Increment attempt counter
      user.passwordResetOTP = incrementOTPAttempts(user.passwordResetOTP);
      await user.save();

      const remaining = getRemainingAttempts(user.passwordResetOTP.attempts, user.passwordResetOTP.maxAttempts);
      
      return res.status(401).json({
        success: false,
        message: `Invalid OTP. ${remaining} attempt(s) remaining.`,
        remainingAttempts: remaining
      });
    }

    // OTP is valid! Generate a temporary reset token (valid for 15 minutes)
    const resetToken = jwt.sign(
      { email: user.email, purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    console.log(`✅ Password reset OTP verified for ${email}`);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        resetToken,
        email: user.email
      }
    });

  } catch (error) {
    logger.error('Verify reset OTP error:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

// POST /api/auth/reset-password - Reset password with verified token
router.post('/reset-password', async (req, res) => {
  try {
    ensureMongoDB();
    
    console.log('🔄 Password reset request received');
    const { resetToken, newPassword } = req.body;
    console.log('📧 Reset token present:', !!resetToken);
    console.log('🔑 New password present:', !!newPassword);

    if (!resetToken || !newPassword) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required'
      });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      console.log('✅ Token verified for email:', decoded.email);
      
      if (decoded.purpose !== 'password_reset') {
        console.log('❌ Invalid token purpose:', decoded.purpose);
        throw new Error('Invalid token purpose');
      }
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Find user
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      console.log('❌ User not found for email:', decoded.email);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User found:', user.email);

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log('✅ Password hashed');
    
    // Update password and clear OTP
    user.password = hashedPassword;
    user.isTemporaryPassword = false;
    user.passwordChangedAt = new Date();
    user.passwordResetOTP = {
      code: null,
      expires: null,
      attempts: 0,
      maxAttempts: 5
    };
    await user.save();

    console.log(`✅ Password reset successful for ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    logger.error('Reset password error:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// PUT /api/auth/update-password - Update user password
router.put('/update-password', async (req, res) => {
  try {
    ensureMongoDB();
    
    const { currentPassword, newPassword, isFirstLogin } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    console.log('🔵 Password update request:', {
      hasToken: !!token,
      hasNewPassword: !!newPassword,
      isFirstLogin,
      hasCurrentPassword: !!currentPassword
    });
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    if (!newPassword) {
      console.log('❌ No new password provided');
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }
    
    // Verify token and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', { userId: decoded.id || decoded.userId });
    
    const user = await User.findById(decoded.id || decoded.userId);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('✅ User found:', {
      email: user.email,
      isTemporaryPassword: user.isTemporaryPassword
    });
    
    // For first login (temporary password), no current password needed
    if (!isFirstLogin && currentPassword) {
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        console.log('❌ Current password incorrect');
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      console.log('✅ Current password verified');
    }
    
    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update user password
    user.password = hashedPassword;
    user.isTemporaryPassword = false;
    user.passwordChangedAt = new Date();
    await user.save();
    
    console.log('✅ Password updated successfully for:', user.email);
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password'
    });
  }
});

module.exports = router;

