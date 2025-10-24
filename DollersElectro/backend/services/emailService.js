const nodemailer = require('nodemailer');

/**
 * Email Service using Gmail SMTP (FREE)
 * Sends OTP codes for login and password reset
 */

// Create transporter with Gmail SMTP
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  Email credentials not configured. Email sending will be simulated.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,     // Your Gmail address
      pass: process.env.EMAIL_PASSWORD  // Your Gmail App Password
    }
  });
};

// Generate 6-digit OTP code
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email for login
const sendLoginOTP = async (email, code, userName) => {
  try {
    const transporter = createTransporter();
    
    // If no transporter (credentials not set), log but don't fail
    if (!transporter) {
      console.log(`📧 [SIMULATED] Login OTP for ${email}: ${code}`);
      return { success: true, simulated: true, code };
    }

    const mailOptions = {
      from: {
        name: 'DollersElectro',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '🔐 Your Login Verification Code - DollersElectro',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; padding: 20px; background: white; border-radius: 10px; margin: 20px 0; letter-spacing: 5px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚡ DollersElectro</h1>
              <p>Login Verification Code</p>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>You're attempting to log in to your DollersElectro account. Please use the verification code below to complete your login:</p>
              
              <div class="otp-code">${code}</div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This code expires in <strong>10 minutes</strong></li>
                  <li>Never share this code with anyone</li>
                  <li>DollersElectro staff will never ask for this code</li>
                </ul>
              </div>
              
              <p>If you didn't request this code, please ignore this email and ensure your account is secure.</p>
              
              <div class="footer">
                <p>© 2024 DollersElectro. All rights reserved.</p>
                <p>This is an automated email, please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Login OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Failed to send login OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP email for password reset
const sendPasswordResetOTP = async (email, code, userName) => {
  try {
    const transporter = createTransporter();
    
    // If no transporter (credentials not set), log but don't fail
    if (!transporter) {
      console.log(`📧 [SIMULATED] Password Reset OTP for ${email}: ${code}`);
      return { success: true, simulated: true, code };
    }

    const mailOptions = {
      from: {
        name: 'DollersElectro',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '🔑 Password Reset Verification Code - DollersElectro',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #f5576c; text-align: center; padding: 20px; background: white; border-radius: 10px; margin: 20px 0; letter-spacing: 5px; }
            .warning { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚡ DollersElectro</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>We received a request to reset your password. Please use the verification code below to proceed:</p>
              
              <div class="otp-code">${code}</div>
              
              <div class="warning">
                <strong>🔒 Security Notice:</strong>
                <ul>
                  <li>This code expires in <strong>10 minutes</strong></li>
                  <li>Never share this code with anyone</li>
                  <li>If you didn't request this reset, contact us immediately</li>
                </ul>
              </div>
              
              <p>After entering this code, you'll be able to create a new password for your account.</p>
              
              <div class="footer">
                <p>© 2024 DollersElectro. All rights reserved.</p>
                <p>This is an automated email, please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Failed to send password reset OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after successful registration
const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log(`📧 [SIMULATED] Welcome email for ${email}`);
      return { success: true, simulated: true };
    }

    const mailOptions = {
      from: {
        name: 'DollersElectro',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '🎉 Welcome to DollersElectro!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚡ Welcome to DollersElectro!</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>Thank you for creating an account with DollersElectro. We're excited to have you with us!</p>
              <p>Your account has been successfully created and is ready to use.</p>
              <p><strong>What's next?</strong></p>
              <ul>
                <li>Browse our extensive electrical products catalog</li>
                <li>Save your favorite items to wishlist</li>
                <li>Get expert recommendations from our AI assistant</li>
                <li>Enjoy secure checkout and fast delivery</li>
              </ul>
              <div class="footer">
                <p>© 2024 DollersElectro. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendLoginOTP,
  sendPasswordResetOTP,
  sendWelcomeEmail
};



