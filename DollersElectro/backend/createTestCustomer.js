const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createTestCustomer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dollerselectro');
    console.log('Connected to MongoDB');

    // Check if test customer already exists
    const existingCustomer = await User.findOne({ email: 'test@customer.com' });
    if (existingCustomer) {
      console.log('Test customer already exists:');
      console.log('Email: test@customer.com');
      console.log('Username: testcustomer');
      console.log('Password: (check console for temporary password)');
      console.log('Role: customer');
      return;
    }

    // Create test customer
    const { user, temporaryPassword } = await User.createCustomer({
      firstName: 'Test',
      lastName: 'Customer',
      email: 'test@customer.com',
      username: 'testcustomer',
      phone: '+1234567890'
    });

    console.log('✅ Test customer created successfully!');
    console.log('📧 Email: test@customer.com');
    console.log('👤 Username: testcustomer');
    console.log('🔑 Temporary Password:', temporaryPassword);
    console.log('👥 Role: customer');
    console.log('🆔 Customer ID:', user.customerId);
    console.log('\n💡 Use these credentials to login as a customer!');

  } catch (error) {
    console.error('❌ Error creating test customer:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestCustomer();
