const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createUsers() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Check if users already exist
    const existingAdmin = await User.findOne({ username: 'admin' });
    const existingEmployee = await User.findOne({ username: 'employee' });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists, updating password...');
      // Update admin password
      const salt = await bcrypt.genSalt(12);
      existingAdmin.password = await bcrypt.hash('admin123', salt);
      existingAdmin.isTemporaryPassword = false;
      existingAdmin.isEmailVerified = true;
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log('✅ Admin password updated successfully!');
    } else {
      // Create admin user
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@dollerselectro.com',
        username: 'admin',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isTemporaryPassword: false,
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
        addresses: [{
          type: 'work',
          street: '123 Admin Street',
          city: 'Admin City',
          state: 'Admin State',
          postalCode: '12345',
          country: 'United States',
          isDefault: true
        }],
        phone: '+1234567890'
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Role: admin');
    }

    if (existingEmployee) {
      console.log('⚠️  Employee user already exists, updating password...');
      // Update employee password
      const salt = await bcrypt.genSalt(12);
      existingEmployee.password = await bcrypt.hash('employee123', salt);
      existingEmployee.isTemporaryPassword = false;
      existingEmployee.isEmailVerified = true;
      existingEmployee.isActive = true;
      await existingEmployee.save();
      console.log('✅ Employee password updated successfully!');
    } else {
      // Create employee user
      const employeeUser = new User({
        firstName: 'Employee',
        lastName: 'User',
        email: 'employee@dollerselectro.com',
        username: 'employee',
        password: await bcrypt.hash('employee123', 12),
        role: 'employee',
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isTemporaryPassword: false,
        employeeId: 'EMP001',
        department: 'support',
        position: 'Customer Support Representative',
        hireDate: new Date(),
        supervisor: existingAdmin._id, // Set admin as supervisor
        permissions: [
          'read_products', 'read_orders', 'write_orders',
          'read_analytics'
        ],
        addresses: [{
          type: 'work',
          street: '456 Employee Street',
          city: 'Employee City',
          state: 'Employee State',
          postalCode: '67890',
          country: 'United States',
          isDefault: true
        }],
        phone: '+1987654321'
      });

      await employeeUser.save();
      console.log('✅ Employee user created successfully!');
      console.log('   Username: employee');
      console.log('   Password: employee123');
      console.log('   Role: employee');
    }

    // Display all users
    console.log('\n📋 Current Users in Database:');
    const allUsers = await User.find({}, 'username email role isActive createdAt');
    allUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.email}) - ${user.role} - ${user.isActive ? 'Active' : 'Inactive'}`);
    });

    console.log('\n🎉 User creation/update completed successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin:');
    console.log('     Username: admin');
    console.log('     Password: admin123');
    console.log('     Role: admin');
    console.log('\n   Employee:');
    console.log('     Username: employee');
    console.log('     Password: employee123');
    console.log('     Role: employee');

  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the script
createUsers();
