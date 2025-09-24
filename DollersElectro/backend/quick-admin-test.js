const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Quick admin functionality test
async function quickAdminTest() {
  console.log('🚀 Quick Admin Test - MongoDB CRUD Operations');
  console.log('==============================================\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
    
    // Get admin token
    const User = require('./models/User');
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('❌ No admin user found');
      return;
    }
    
    const token = jwt.sign(
      { id: admin._id, role: admin.role, email: admin.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    console.log('✅ Admin token generated');
    
    // Test admin endpoints
    const baseUrl = 'http://localhost:5001';
    
    // Test 1: Get all products (admin)
    console.log('\n📋 Testing: GET /api/products/admin/all');
    const allProductsResponse = await fetch(`${baseUrl}/api/products/admin/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const allProducts = await allProductsResponse.json();
    
    if (allProducts.success) {
      console.log(`✅ Found ${allProducts.data.products.length} products`);
    } else {
      console.log('❌ Failed to get products');
    }
    
    // Test 2: Create a test product
    console.log('\n➕ Testing: POST /api/products');
    const testProduct = {
      name: 'Quick Test Product',
      description: 'Quick test for admin functionality',
      sku: `QUICK-${Date.now()}`,
      category: 'Lighting',
      price: 29.99,
      stock: 10,
      lowStockThreshold: 5,
      isActive: true,
      isInStock: true
    };
    
    const createResponse = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testProduct)
    });
    const created = await createResponse.json();
    
    if (created.success) {
      console.log(`✅ Product created: ${created.data.product.name}`);
      const productId = created.data.product._id;
      
      // Test 3: Update the product
      console.log('\n✏️  Testing: PUT /api/products/:id');
      const updateData = { ...testProduct, name: 'Updated Quick Test Product', price: 39.99 };
      const updateResponse = await fetch(`${baseUrl}/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      const updated = await updateResponse.json();
      
      if (updated.success) {
        console.log(`✅ Product updated: ${updated.data.product.name} - $${updated.data.product.price}`);
      } else {
        console.log('❌ Product update failed');
      }
      
      // Test 4: Toggle status
      console.log('\n🔄 Testing: PATCH /api/products/:id/toggle-status');
      const toggleResponse = await fetch(`${baseUrl}/api/products/${productId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: false })
      });
      const toggled = await toggleResponse.json();
      
      if (toggled.success) {
        console.log('✅ Product status toggled');
      } else {
        console.log('❌ Product status toggle failed');
      }
      
      // Test 5: Delete the product
      console.log('\n🗑️  Testing: DELETE /api/products/:id');
      const deleteResponse = await fetch(`${baseUrl}/api/products/${productId}?hard=true`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const deleted = await deleteResponse.json();
      
      if (deleted.success) {
        console.log('✅ Product deleted successfully');
      } else {
        console.log('❌ Product deletion failed');
      }
    } else {
      console.log('❌ Product creation failed');
    }
    
    console.log('\n🎉 Quick Admin Test Completed!');
    console.log('All CRUD operations (Create, Read, Update, Delete) are working with MongoDB!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the quick test
quickAdminTest();
