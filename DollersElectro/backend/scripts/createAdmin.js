const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dollers_electro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@dollerselectro.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Username:', existingAdmin.username);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@dollerselectro.com',
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      employeeId: 'ADM001',
      department: 'management',
      position: 'System Administrator',
      hireDate: new Date(),
      permissions: [
        'read_products', 'write_products', 'delete_products',
        'read_orders', 'write_orders', 'delete_orders',
        'read_users', 'write_users', 'delete_users',
        'read_analytics', 'write_analytics',
        'manage_system', 'manage_roles'
      ],
      phone: '0712345678'
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Username:', adminUser.username);
    console.log('🔑 Password: admin123');
    console.log('👑 Role:', adminUser.role);
    console.log('🆔 Employee ID:', adminUser.employeeId);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
createAdminUser();


