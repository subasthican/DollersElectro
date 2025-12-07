/**
 * OTP Utility Functions
 * Helper functions for OTP generation, validation, and management
 */

// Generate OTP expiration time (10 minutes from now)
const getOTPExpiration = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

// Check if OTP is expired
const isOTPExpired = (expiresDate) => {
  if (!expiresDate) return true;
  return new Date() > new Date(expiresDate);
};

// Check if OTP attempts exceeded
const isOTPAttemptsExceeded = (attempts, maxAttempts = 5) => {
  return attempts >= maxAttempts;
};

// Validate OTP code format (6 digits)
const isValidOTPFormat = (code) => {
  return /^\d{6}$/.test(code);
};

// Reset OTP data
const resetOTP = () => {
  return {
    code: null,
    expires: null,
    attempts: 0,
    maxAttempts: 5
  };
};

// Create new OTP data
const createOTPData = (code) => {
  return {
    code: code,
    expires: getOTPExpiration(),
    attempts: 0,
    maxAttempts: 5
  };
};

// Increment OTP attempt counter
const incrementOTPAttempts = (otpData) => {
  if (!otpData) {
    return { attempts: 1, maxAttempts: 5 };
  }
  return {
    ...otpData,
    attempts: (otpData.attempts || 0) + 1
  };
};

// Calculate remaining attempts
const getRemainingAttempts = (attempts, maxAttempts = 5) => {
  const remaining = maxAttempts - attempts;
  return remaining > 0 ? remaining : 0;
};

// Get time until OTP expires (in minutes)
const getTimeUntilExpiry = (expiresDate) => {
  if (!expiresDate) return 0;
  const now = new Date();
  const expires = new Date(expiresDate);
  const diffMs = expires - now;
  const diffMins = Math.floor(diffMs / 60000);
  return diffMins > 0 ? diffMins : 0;
};

// Format OTP code for display (add spaces: 123 456)
const formatOTPCode = (code) => {
  if (!code || code.length !== 6) return code;
  return `${code.slice(0, 3)} ${code.slice(3)}`;
};

// Clean OTP code (remove spaces and non-digits)
const cleanOTPCode = (code) => {
  if (!code) return '';
  return code.replace(/\D/g, '');
};

module.exports = {
  getOTPExpiration,
  isOTPExpired,
  isOTPAttemptsExceeded,
  isValidOTPFormat,
  resetOTP,
  createOTPData,
  incrementOTPAttempts,
  getRemainingAttempts,
  getTimeUntilExpiry,
  formatOTPCode,
  cleanOTPCode
};




