const fs = require('fs');
const path = require('path');

// Local database path
const dbPath = path.join(__dirname, 'database', 'data');

// Load data from JSON files
function loadCollection(collectionName) {
  const filePath = path.join(dbPath, `${collectionName}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading collection ${collectionName}:`, error);
      return [];
    }
  }
  return [];
}

// Save data to JSON files
function saveCollection(collectionName, data) {
  const filePath = path.join(dbPath, `${collectionName}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving collection ${collectionName}:`, error);
  }
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function createTestOrder() {
  try {
    // Load existing data
    const users = loadCollection('users');
    const products = loadCollection('products');
    const orders = loadCollection('orders');

    // Find a test user (admin)
    const user = users.find(u => u.email === 'admin@dollerselectro.com');
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    // Find a test product
    const product = products[0];
    if (!product) {
      console.log('❌ No products found in database');
      return;
    }

    // Create test order
    const testOrder = {
      _id: generateId(),
      orderNumber: 'TEST-ORD-001',
      customer: user._id || user.id,
      items: [{
        product: product._id || product.id,
        quantity: 2,
        price: product.price,
        total: product.price * 2
      }],
      total: product.price * 2,
      status: 'pending',
      delivery: {
        method: 'store_pickup',
        status: 'pending',
        address: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'United States',
          phone: '+1234567890'
        }
      },
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      orderDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerNotes: 'This is a test order'
    };

    // Add to orders array
    orders.push(testOrder);
    
    // Save back to file
    saveCollection('orders', orders);
    
    console.log('✅ Test order created successfully!');
    console.log('Order ID:', testOrder._id);
    console.log('Order Number:', testOrder.orderNumber);
    console.log('Customer:', user.email);
    console.log('Total:', testOrder.total);
    console.log('Orders in database:', orders.length);
    
  } catch (error) {
    console.error('❌ Error creating test order:', error);
  }
}

createTestOrder();
