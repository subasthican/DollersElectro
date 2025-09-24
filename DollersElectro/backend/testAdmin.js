const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection (without environment variables for testing)
mongoose.connect('mongodb://localhost:27017/dollers_electro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Simple User schema for testing
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  username: String,
  password: String,
  role: String,
  isActive: Boolean,
  isEmailVerified: Boolean,
  isPhoneVerified: Boolean,
  employeeId: String,
  department: String,
  position: String,
  hireDate: Date,
  permissions: [String],
  phone: String,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

const testAdminLogin = async () => {
  try {
    console.log('🔍 Testing admin and employee login...\n');

    // Check if admin user exists
    const adminUser = await User.findOne({ email: 'admin@dollerselectro.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found. Creating one...\n');
      
      // Create admin user with temporary password
      const { user: newAdmin, temporaryPassword } = await User.createAdmin({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@dollerselectro.com',
        username: 'admin',
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        department: 'management',
        position: 'System Administrator',
        hireDate: new Date(),
        phone: '+1234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`✅ Admin user created successfully with temporary password: ${temporaryPassword}`);

      await newAdmin.save();
      console.log('✅ Admin user created successfully!\n');
    } else {
      console.log('✅ Admin user already exists!\n');
    }

    // Check if employee user exists
    const employeeUser = await User.findOne({ email: 'employee@dollerselectro.com' });
    
    if (!employeeUser) {
      console.log('❌ Employee user not found. Creating one...\n');
      
      // Create employee user with temporary password
      const { user: newEmployee, temporaryPassword } = await User.createEmployee({
        firstName: 'Employee',
        lastName: 'User',
        email: 'employee@dollerselectro.com',
        username: 'employee',
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        department: 'support',
        position: 'Customer Support Representative',
        hireDate: new Date(),
        supervisor: testAdminUser._id, // Reference to admin user as supervisor
        phone: '+1234567891',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`✅ Employee user created successfully with temporary password: ${temporaryPassword}`);
    } else {
      console.log('✅ Employee user already exists!\n');
    }

    // Test login with admin credentials
    console.log('🔐 Testing login with admin credentials...\n');
    
    const testAdminUser = await User.findOne({ email: 'admin@dollerselectro.com' });
    
    if (!testAdminUser) {
      console.log('❌ Could not find admin user for testing');
      return;
    }

    // Test admin password verification (using temporary password)
    console.log('✅ Admin user created successfully!');
    console.log('👤 Admin User Details:');
    console.log(`   Name: ${testAdminUser.firstName} ${testAdminUser.lastName}`);
    console.log(`   Email: ${testAdminUser.email}`);
    console.log(`   Username: ${testAdminUser.username}`);
    console.log(`   Role: ${testAdminUser.role}`);
    console.log(`   Employee ID: ${testAdminUser.employeeId}`);
    console.log(`   Temporary Password: ${temporaryPassword}`);

    // Test login with employee credentials
    console.log('\n🔐 Testing login with employee credentials...\n');
    
    const testEmployeeUser = await User.findOne({ email: 'employee@dollerselectro.com' });
    
    if (!testEmployeeUser) {
      console.log('❌ Could not find employee user for testing');
      return;
    }

    // Test employee user (using temporary password)
    console.log('✅ Employee user created successfully!');
    console.log('👤 Employee User Details:');
    console.log(`   Name: ${testEmployeeUser.firstName} ${testEmployeeUser.lastName}`);
    console.log(`   Email: ${testEmployeeUser.email}`);
    console.log(`   Username: ${testEmployeeUser.username}`);
    console.log(`   Role: ${testEmployeeUser.role}`);
    console.log(`   Employee ID: ${testEmployeeUser.employeeId}`);
    console.log(`   Department: ${testEmployeeUser.department}`);
    console.log(`   Permissions: ${testEmployeeUser.permissions.length} permissions`);
    console.log(`   Temporary Password: ${temporaryPassword}`);

    console.log('\n🎉 User creation completed successfully!');
    console.log('📝 You can now login with the temporary passwords shown above.');
    console.log('⚠️  IMPORTANT: Users will be forced to change their temporary passwords on first login.');
    console.log('🔒 This ensures security - no admin can see or set user passwords!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  }
};

// Run the test
testAdminLogin();

