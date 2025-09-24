const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function listUsers() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Get all users
    const users = await User.find({}, 'username email role isActive firstName lastName createdAt');
    
    console.log('\n📋 All Users in Database:');
    console.log('========================');
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User Details:`);
      console.log(`   👤 Username: ${user.username}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🏷️  Role: ${user.role}`);
      console.log(`   📛 Name: ${user.firstName} ${user.lastName}`);
      console.log(`   ✅ Status: ${user.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   📅 Created: ${user.createdAt.toLocaleDateString()}`);
    });

    console.log('\n🔑 Test Login Credentials:');
    console.log('========================');
    console.log('\n👑 Admin User:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    
    console.log('\n👷 Employee User:');
    console.log('   Username: employee');
    console.log('   Password: employee123');
    console.log('   Role: employee');
    
    console.log('\n👥 Customer User:');
    console.log('   Username: testcustomer');
    console.log('   Password: J^!9pN4$uT@2');
    console.log('   Role: customer');
    
    console.log('\n💡 Note: Customer password is temporary and should be changed on first login');

  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the script
listUsers();







