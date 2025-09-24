require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@dollerselectro.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Admin user ID:', existingAdmin._id);
      process.exit(0);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@dollerselectro.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      isTwoFactorEnabled: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('Admin user ID:', adminUser._id);
    console.log('Email: admin@dollerselectro.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdminUser();
