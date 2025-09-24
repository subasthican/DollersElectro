const crypto = require('crypto');

/**
 * Generate a secure temporary password
 * @returns {string} A secure temporary password
 */
const generateTemporaryPassword = () => {
  // Generate a random password with mixed case, numbers, and symbols
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each category
  password += charset.charAt(Math.floor(Math.random() * 26)); // Uppercase
  password += charset.charAt(26 + Math.floor(Math.random() * 26)); // Lowercase
  password += charset.charAt(52 + Math.floor(Math.random() * 10)); // Number
  password += charset.charAt(62 + Math.floor(Math.random() * 8)); // Symbol
  
  // Fill the rest randomly
  for (let i = 4; i < 12; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  // Shuffle the password to make it more random
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and message
 */
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${minLength} characters long`
    };
  }
  
  if (!hasUpperCase) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }
  
  if (!hasLowerCase) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }
  
  if (!hasNumbers) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }
  
  if (!hasSpecialChar) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character'
    };
  }
  
  return {
    isValid: true,
    message: 'Password meets strength requirements'
  };
};

/**
 * Check if password is temporary (first login)
 * @param {string} password - Password to check
 * @returns {boolean} True if password appears to be temporary
 */
const isTemporaryPassword = (password) => {
  // Check if password matches the pattern of generated temporary passwords
  // This is a simple check - in production you might want to store a flag in the database
  return password.length === 12 && /^[A-Za-z0-9!@#$%^&*]+$/.test(password);
};

module.exports = {
  generateTemporaryPassword,
  validatePasswordStrength,
  isTemporaryPassword
};
