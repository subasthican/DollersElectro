/**
 * Script to update admin email to real email address
 * Run: node scripts/updateAdminEmail.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const updateAdminEmail = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dollerselectro';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find admin user by old email
    const oldEmail = 'admin@dollerselectro.com';
    const newEmail = 'manoharansubasthican@gmail.com';

    let admin = await User.findOne({ email: oldEmail });
    
    if (!admin) {
      console.log('⚠️  Admin not found with old email, checking for existing admin...');
      admin = await User.findOne({ role: 'admin' });
    }

    if (admin) {
      // Update email
      admin.email = newEmail;
      await admin.save();
      
      console.log('✅ Admin email updated successfully!');
      console.log('📧 Old email:', oldEmail);
      console.log('📧 New email:', newEmail);
      console.log('🔑 Password: Admin@123 (unchanged)');
      console.log('👤 Role:', admin.role);
      console.log('📛 Name:', admin.firstName, admin.lastName);
    } else {
      console.log('❌ No admin user found');
    }

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin email:', error);
    process.exit(1);
  }
};

updateAdminEmail();




