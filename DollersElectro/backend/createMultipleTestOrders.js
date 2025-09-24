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

async function createMultipleTestOrders() {
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

    // Find test products
    const product1 = products[0];
    const product2 = products[1] || products[0];
    if (!product1) {
      console.log('❌ No products found in database');
      return;
    }

    // Create multiple test orders with different statuses
    const testOrders = [
      {
        _id: generateId(),
        orderNumber: 'ORD-001',
        customer: user._id || user.id,
        items: [{
          product: product1._id || product1.id,
          quantity: 1,
          price: product1.price,
          total: product1.price
        }],
        total: product1.price,
        status: 'confirmed',
        delivery: {
          method: 'store_pickup',
          status: 'processing',
          address: {
            street: '123 Main St',
            city: 'Tech City',
            state: 'CA',
            zipCode: '90210',
            country: 'United States',
            phone: '+1234567890'
          }
        },
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'pending',
        orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        customerNotes: 'First test order'
      },
      {
        _id: generateId(),
        orderNumber: 'ORD-002',
        customer: user._id || user.id,
        items: [{
          product: product2._id || product2.id,
          quantity: 2,
          price: product2.price,
          total: product2.price * 2
        }],
        total: product2.price * 2,
        status: 'processing',
        delivery: {
          method: 'home_delivery',
          status: 'shipped',
          address: {
            street: '456 Oak Ave',
            city: 'Tech City',
            state: 'CA',
            zipCode: '90211',
            country: 'United States',
            phone: '+1234567890'
          },
          trackingNumber: 'TRK123456789',
          carrier: 'FedEx'
        },
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        customerNotes: 'Second test order with delivery'
      },
      {
        _id: generateId(),
        orderNumber: 'ORD-003',
        customer: user._id || user.id,
        items: [{
          product: product1._id || product1.id,
          quantity: 3,
          price: product1.price,
          total: product1.price * 3
        }],
        total: product1.price * 3,
        status: 'delivered',
        delivery: {
          method: 'store_pickup',
          status: 'delivered',
          address: {
            street: '789 Pine St',
            city: 'Tech City',
            state: 'CA',
            zipCode: '90212',
            country: 'United States',
            phone: '+1234567890'
          }
        },
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'paid',
        orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        customerNotes: 'Third test order - delivered'
      }
    ];

    // Add to orders array
    orders.push(...testOrders);
    
    // Save back to file
    saveCollection('orders', orders);
    
    console.log('✅ Multiple test orders created successfully!');
    console.log('Total orders in database:', orders.length);
    
    testOrders.forEach((order, index) => {
      console.log(`Order ${index + 1}: ${order.orderNumber} - Status: ${order.status} - Delivery: ${order.delivery.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating test orders:', error);
  }
}

createMultipleTestOrders();




