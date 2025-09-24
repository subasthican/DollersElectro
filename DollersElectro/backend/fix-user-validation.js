const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixUserValidation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find users with invalid phone numbers
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      let needsUpdate = false;
      const updates = {};

      // Fix phone number format
      if (user.phone && !/^[0-9]{10}$/.test(user.phone.trim())) {
        console.log(`Fixing phone for user ${user.email}: ${user.phone}`);
        // Remove all non-digits and take last 10 digits
        const cleanPhone = user.phone.replace(/\D/g, '').slice(-10);
        if (cleanPhone.length === 10) {
          updates.phone = cleanPhone;
          needsUpdate = true;
        } else {
          // If still invalid, set to null
          updates.phone = null;
          needsUpdate = true;
        }
      }

      // Add missing required fields for non-customer roles
      if (user.role !== 'customer') {
        if (!user.hireDate) {
          updates.hireDate = new Date('2024-01-01');
          needsUpdate = true;
        }
        if (!user.position) {
          updates.position = user.role === 'admin' ? 'System Administrator' : 'Employee';
          needsUpdate = true;
        }
        if (!user.department) {
          updates.department = user.role === 'admin' ? 'management' : 'operations';
          needsUpdate = true;
        }
      }

      // Add missing required fields for all users
      if (!user.isPhoneVerified) {
        updates.isPhoneVerified = false;
        needsUpdate = true;
      }
      if (!user.addresses) {
        updates.addresses = [];
        needsUpdate = true;
      }
      if (!user.preferences) {
        updates.preferences = {
          newsletter: true,
          marketing: false,
          language: 'en',
          currency: 'USD'
        };
        needsUpdate = true;
      }
      if (!user.createdAt) {
        updates.createdAt = new Date();
        needsUpdate = true;
      }

      if (needsUpdate) {
        console.log(`Updating user ${user.email}...`);
        await User.updateOne({ _id: user._id }, updates);
        console.log(`✅ Updated user ${user.email}`);
      }
    }

    console.log('✅ User validation fixes completed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error fixing user validation:', error);
    process.exit(1);
  }
}

fixUserValidation();
