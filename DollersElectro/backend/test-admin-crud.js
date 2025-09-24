const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Test configuration
const BASE_URL = 'http://localhost:5001';
const TEST_PRODUCT = {
  name: 'Test Product for CRUD',
  description: 'This is a test product to verify CRUD operations',
  sku: 'TEST-CRUD-001',
  category: 'Lighting',
  price: 99.99,
  stock: 50,
  lowStockThreshold: 10,
  images: [{ url: 'https://via.placeholder.com/300x300', alt: 'Test Product', isPrimary: true }],
  tags: ['test', 'crud', 'verification'],
  features: ['Test Feature 1', 'Test Feature 2'],
  specifications: { 'Material': 'Test Material', 'Color': 'Test Color' },
  warranty: '1 Year Test Warranty',
  weight: 1.5,
  shippingClass: 'standard',
  isActive: true,
  isInStock: true,
  isFeatured: false,
  isOnSale: false
};

let adminToken = '';
let createdProductId = '';

// Helper function to make HTTP requests
async function makeRequest(method, endpoint, data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { status: 500, data: { success: false, message: error.message } };
  }
}

// Test functions
async function testMongoDBConnection() {
  console.log('🔌 Testing MongoDB connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

async function createAdminToken() {
  console.log('🔑 Creating admin token...');
  try {
    const User = require('./models/User');
    
    // Find or create admin user
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('Creating admin user...');
      const { user, temporaryPassword } = await User.createAdmin({
        firstName: 'Test',
        lastName: 'Admin',
        email: 'testadmin@dollerselectro.com',
        username: 'testadmin',
        department: 'management',
        position: 'Test Administrator'
      });
      admin = user;
      console.log('Admin created with temp password:', temporaryPassword);
    }
    
    // Generate token
    adminToken = jwt.sign(
      { id: admin._id, role: admin.role, email: admin.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    console.log('✅ Admin token created');
    return true;
  } catch (error) {
    console.log('❌ Failed to create admin token:', error.message);
    return false;
  }
}

async function testCreateProduct() {
  console.log('\n📝 Testing CREATE operation...');
  
  const response = await makeRequest('POST', '/api/products', TEST_PRODUCT, adminToken);
  
  if (response.status === 201 && response.data.success) {
    createdProductId = response.data.data.product._id;
    console.log('✅ Product created successfully');
    console.log(`   Product ID: ${createdProductId}`);
    console.log(`   Product Name: ${response.data.data.product.name}`);
    return true;
  } else {
    console.log('❌ Product creation failed');
    console.log(`   Status: ${response.status}`);
    console.log(`   Error: ${response.data.message}`);
    return false;
  }
}

async function testReadProduct() {
  console.log('\n👁️  Testing READ operation...');
  
  // Test 1: Get single product
  const singleResponse = await makeRequest('GET', `/api/products/${createdProductId}`, null, adminToken);
  
  if (singleResponse.status === 200 && singleResponse.data.success) {
    console.log('✅ Single product retrieved successfully');
    console.log(`   Product Name: ${singleResponse.data.data.product.name}`);
  } else {
    console.log('❌ Single product retrieval failed');
    console.log(`   Error: ${singleResponse.data.message}`);
    return false;
  }
  
  // Test 2: Get all products (admin)
  const allResponse = await makeRequest('GET', '/api/products/admin/all', null, adminToken);
  
  if (allResponse.status === 200 && allResponse.data.success) {
    console.log('✅ All products retrieved successfully');
    console.log(`   Total products: ${allResponse.data.data.products.length}`);
    
    // Verify our test product is in the list
    const testProduct = allResponse.data.data.products.find(p => p._id === createdProductId);
    if (testProduct) {
      console.log('✅ Test product found in product list');
    } else {
      console.log('❌ Test product not found in product list');
      return false;
    }
  } else {
    console.log('❌ All products retrieval failed');
    console.log(`   Error: ${allResponse.data.message}`);
    return false;
  }
  
  return true;
}

async function testUpdateProduct() {
  console.log('\n✏️  Testing UPDATE operation...');
  
  const updatedData = {
    ...TEST_PRODUCT,
    name: 'Updated Test Product for CRUD',
    price: 149.99,
    stock: 75,
    description: 'This product has been updated to test UPDATE operation',
    tags: ['test', 'crud', 'verification', 'updated']
  };
  
  const response = await makeRequest('PUT', `/api/products/${createdProductId}`, updatedData, adminToken);
  
  if (response.status === 200 && response.data.success) {
    console.log('✅ Product updated successfully');
    console.log(`   Updated Name: ${response.data.data.product.name}`);
    console.log(`   Updated Price: $${response.data.data.product.price}`);
    console.log(`   Updated Stock: ${response.data.data.product.stock}`);
    return true;
  } else {
    console.log('❌ Product update failed');
    console.log(`   Status: ${response.status}`);
    console.log(`   Error: ${response.data.message}`);
    return false;
  }
}

async function testToggleProductStatus() {
  console.log('\n🔄 Testing TOGGLE STATUS operation...');
  
  // Test deactivate
  const deactivateResponse = await makeRequest('PATCH', `/api/products/${createdProductId}/toggle-status`, 
    { isActive: false }, adminToken);
  
  if (deactivateResponse.status === 200 && deactivateResponse.data.success) {
    console.log('✅ Product deactivated successfully');
  } else {
    console.log('❌ Product deactivation failed');
    console.log(`   Error: ${deactivateResponse.data.message}`);
    return false;
  }
  
  // Test activate
  const activateResponse = await makeRequest('PATCH', `/api/products/${createdProductId}/toggle-status`, 
    { isActive: true }, adminToken);
  
  if (activateResponse.status === 200 && activateResponse.data.success) {
    console.log('✅ Product activated successfully');
    return true;
  } else {
    console.log('❌ Product activation failed');
    console.log(`   Error: ${activateResponse.data.message}`);
    return false;
  }
}

async function testDeleteProduct() {
  console.log('\n🗑️  Testing DELETE operation...');
  
  const response = await makeRequest('DELETE', `/api/products/${createdProductId}?hard=true`, null, adminToken);
  
  if (response.status === 200 && response.data.success) {
    console.log('✅ Product deleted successfully');
    console.log(`   Deleted Product ID: ${createdProductId}`);
    return true;
  } else {
    console.log('❌ Product deletion failed');
    console.log(`   Status: ${response.status}`);
    console.log(`   Error: ${response.data.message}`);
    return false;
  }
}

async function verifyProductDeleted() {
  console.log('\n🔍 Verifying product deletion...');
  
  const response = await makeRequest('GET', `/api/products/${createdProductId}`, null, adminToken);
  
  if (response.status === 404) {
    console.log('✅ Product deletion verified - product not found');
    return true;
  } else {
    console.log('❌ Product still exists after deletion');
    console.log(`   Status: ${response.status}`);
    return false;
  }
}

// Main test function
async function runCRUDTests() {
  console.log('🚀 Starting MongoDB CRUD Test Suite');
  console.log('=====================================\n');
  
  const results = {
    mongoConnection: false,
    adminToken: false,
    create: false,
    read: false,
    update: false,
    toggleStatus: false,
    delete: false,
    verifyDelete: false
  };
  
  try {
    // Test MongoDB connection
    results.mongoConnection = await testMongoDBConnection();
    if (!results.mongoConnection) {
      console.log('\n❌ Cannot proceed without MongoDB connection');
      return;
    }
    
    // Create admin token
    results.adminToken = await createAdminToken();
    if (!results.adminToken) {
      console.log('\n❌ Cannot proceed without admin token');
      return;
    }
    
    // Run CRUD tests
    results.create = await testCreateProduct();
    if (results.create) {
      results.read = await testReadProduct();
    }
    if (results.read) {
      results.update = await testUpdateProduct();
    }
    if (results.update) {
      results.toggleStatus = await testToggleProductStatus();
    }
    if (results.toggleStatus) {
      results.delete = await testDeleteProduct();
    }
    if (results.delete) {
      results.verifyDelete = await verifyProductDeleted();
    }
    
    // Print results summary
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log(`MongoDB Connection: ${results.mongoConnection ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Admin Token: ${results.adminToken ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`CREATE Product: ${results.create ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`READ Product: ${results.read ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`UPDATE Product: ${results.update ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`TOGGLE Status: ${results.toggleStatus ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`DELETE Product: ${results.delete ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Verify Deletion: ${results.verifyDelete ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
      console.log('\n🎉 ALL TESTS PASSED! MongoDB CRUD operations are working perfectly!');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.log('\n💥 Test suite crashed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the tests
runCRUDTests();
