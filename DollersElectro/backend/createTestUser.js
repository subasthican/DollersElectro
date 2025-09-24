const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function createTestUser() {
  try {
    const usersPath = path.join(__dirname, 'database/data/users.json');
    
    // Load existing users
    let users = [];
    if (fs.existsSync(usersPath)) {
      const data = fs.readFileSync(usersPath, 'utf8');
      users = JSON.parse(data);
    }
    
    // Check if test user already exists
    const existingUser = users.find(user => user.email === 'test@example.com');
    
    if (existingUser) {
      console.log('Test user already exists, updating password...');
      // Update password to a known value
      const salt = await bcrypt.genSalt(12);
      existingUser.password = await bcrypt.hash('password123', salt);
      existingUser.isActive = true;
      existingUser.isEmailVerified = true;
    } else {
      console.log('Creating new test user...');
      // Create new test user
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      const newUser = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        role: 'customer',
        isActive: true,
        isEmailVerified: true,
        isTwoFactorEnabled: false,
        customerId: `CUST${Date.now()}`,
        permissions: ['read_products', 'read_orders', 'write_orders'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      users.push(newUser);
    }
    
    // Save updated users
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    
    console.log('✅ Test user created/updated successfully!');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('   Role: customer');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

createTestUser();

